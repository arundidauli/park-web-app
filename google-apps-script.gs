// ============================================================
// Google Apps Script — 7 Ajoobe Park Bookings
// ============================================================
// SETUP:
// 1. Create a Google Sheet
// 2. Extensions > Apps Script > paste this entire script
// 3. Go to Project Settings > Script Properties > Add:
//    - RAZORPAY_KEY_ID = rzp_test_xxxxx
//    - RAZORPAY_KEY_SECRET = xxxxxxx
// 4. Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone)
// 5. Copy the Web App URL → set in frontend .env as REACT_APP_SHEETS_URL
// ============================================================

const RAZORPAY_API = "https://api.razorpay.com/v1";
const SETTINGS_SHEET = "settings";

function doGet(e) {
  const action = e.parameter.action;

  if (action === "validate") {
    return handleValidate(e.parameter.ticketId, e.parameter.date);
  }

  if (action === "settings") {
    return handleGetSettings();
  }

  return jsonResponse({ status: "ok", message: "7 Ajoobe Park Booking API" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case "create-order":
        return handleCreateOrder(data);
      case "verify-payment":
        return handleVerifyPayment(data);
      case "validate":
        return handleValidate(data.ticketId, data.date);
      default:
        return jsonResponse({ success: false, error: "Unknown action" });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ─── Settings / Holidays ────────────────────────────────────
function handleGetSettings() {
  const settings = readSettings();
  return jsonResponse(settings);
}

function readSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ws = ss.getSheetByName(SETTINGS_SHEET);

  if (!ws) {
    return { holidays: [], config: { park_open: "true", booking_hold_enabled: "true" } };
  }

  const data = ws.getDataRange().getValues();
  var holidays = [];
  var config = {};

  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0] || "").trim();
    var value = String(data[i][1] || "").trim();

    if (!key) continue;
    if (key.charAt(0) === "#") continue;

    if (key.indexOf("holiday:") === 0) {
      var dateStr = key.substring(8).trim();
      var reason = (value && value !== "true") ? value : "Holiday";
      holidays.push({ date: dateStr, reason: reason });
    } else {
      config[key] = value;
    }
  }

  return { holidays: holidays, config: config };
}

function isHoliday(dateStr) {
  var settings = readSettings();

  // Check park_open
  if (settings.config.park_open === "false") {
    return { closed: true, reason: "Park is currently closed" };
  }

  // Check holidays
  for (var i = 0; i < settings.holidays.length; i++) {
    if (settings.holidays[i].date === dateStr) {
      return { closed: true, reason: settings.holidays[i].reason };
    }
  }

  return { closed: false };
}

// ─── Create Razorpay Order ──────────────────────────────────
function handleCreateOrder(data) {
  const { amount, bookingId, receipt, date } = data;

  if (!amount || amount <= 0) {
    return jsonResponse({ success: false, error: "Invalid amount" });
  }

  // Check holiday before creating order
  if (date) {
    var holidayCheck = isHoliday(date);
    if (holidayCheck.closed) {
      return jsonResponse({ success: false, error: "Park closed on " + date + " — " + holidayCheck.reason });
    }
  }

  const props = PropertiesService.getScriptProperties();
  const keyId = props.getProperty("RAZORPAY_KEY_ID");
  const keySecret = props.getProperty("RAZORPAY_KEY_SECRET");

  if (!keyId || !keySecret) {
    return jsonResponse({ success: false, error: "Razorpay not configured." });
  }

  const payload = {
    amount: amount * 100,
    currency: "INR",
    receipt: receipt || bookingId,
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Basic " + Utilities.base64Encode(keyId + ":" + keySecret),
    },
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(RAZORPAY_API + "/orders", options);
  const order = JSON.parse(response.getContentText());

  return jsonResponse({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: keyId,
  });
}

// ─── Verify Payment + Save Booking ───────────────────────────
function handleVerifyPayment(data) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    booking,
  } = data;

  // Verify signature
  const props = PropertiesService.getScriptProperties();
  const keySecret = props.getProperty("RAZORPAY_KEY_SECRET");

  const expectedSig = Utilities.computeHmacSha256Signature(
    razorpay_order_id + "|" + razorpay_payment_id,
    keySecret
  );

  if (expectedSig !== razorpay_signature) {
    return jsonResponse({ success: false, error: "Payment verification failed" });
  }

  // Save to sheet (daily worksheet by visit date)
  const ws = getOrCreateSheet(booking.date);
  const totalTickets = (booking.adults || 0) + (booking.kidsUnder3 || 0);

  const ticketIds = [];
  for (let i = 1; i <= totalTickets; i++) {
    ticketIds.push(booking.bookingId + "-" + String(i).padStart(2, "0"));
  }

  const row = [
    ticketIds.join(", "),
    new Date().toISOString(),
    booking.date,
    booking.name,
    booking.phone,
    booking.email || "",
    booking.adults || 0,
    booking.kidsUnder3 || 0,
    booking.rate || 50,
    booking.total || 0,
    booking.dayType || "Weekday",
    "Confirmed",
    razorpay_payment_id,
  ];

  ws.appendRow(row);

  // Send confirmation email
  try {
    sendConfirmationEmail(booking, ticketIds, razorpay_payment_id);
  } catch (e) {
    Logger.log("Email failed: " + e.message);
  }

  return jsonResponse({
    success: true,
    ticketIds: ticketIds,
    paymentId: razorpay_payment_id,
    message: "Booking confirmed",
  });
}

// ─── Validate Ticket (for Flutter scanner) ───────────────────
function handleValidate(ticketId, date) {
  if (!ticketId) {
    return jsonResponse({ success: false, error: "No ticket ID provided" });
  }

  var sheets;
  if (date) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ws = ss.getSheetByName(date);
    if (!ws) {
      return jsonResponse({ valid: false, reason: "Ticket not found", ticketId: ticketId });
    }
    sheets = [ws];
  } else {
    sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  }

  for (var s = 0; s < sheets.length; s++) {
    var data = sheets[s].getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var ticketIdsCell = String(row[0]);

      if (ticketIdsCell.includes(ticketId)) {
        var status = row[11];

        if (status === "Used") {
          return jsonResponse({
            valid: false,
            reason: "Ticket already used",
            ticketId: ticketId,
          });
        }

        if (status === "Hold") {
          return jsonResponse({
            valid: false,
            reason: "Booking on hold — not confirmed yet",
            ticketId: ticketId,
          });
        }

        if (status !== "Confirmed") {
          return jsonResponse({
            valid: false,
            reason: "Ticket not confirmed",
            ticketId: ticketId,
          });
        }

        // Mark as Used
        sheets[s].getRange(i + 1, 12).setValue("Used");

        return jsonResponse({
          valid: true,
          ticketId: ticketId,
          name: row[3],
          date: row[2],
          adults: row[6],
          kids: row[7],
          total: row[9],
          message: "Entry granted",
        });
      }
    }
  }

  return jsonResponse({
    valid: false,
    reason: "Ticket not found",
    ticketId: ticketId,
  });
}

// ─── Send Confirmation Email ─────────────────────────────────
function sendConfirmationEmail(booking, ticketIds, paymentId) {
  const subject = "Your 7 Ajoobe Park Tickets — " + booking.bookingId;

  const ticketList = ticketIds
    .map((id) => "<li style='font-family:monospace;font-size:16px;padding:4px 0;'>" + id + "</li>")
    .join("");

  const htmlBody = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#1E1B4B;color:#FACC15;padding:30px;border-radius:16px 16px 0 0;">
        <h1 style="margin:0;font-size:24px;">7 अजूबे पार्क</h1>
        <p style="margin:8px 0 0;opacity:0.8;">Booking Confirmed!</p>
      </div>

      <div style="background:#fff;padding:30px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;">
        <p style="color:#0F172A;font-size:16px;">Hi <strong>${booking.name}</strong>,</p>
        <p style="color:#475569;">Your tickets for <strong>${booking.date}</strong> are confirmed.</p>

        <div style="background:#FFFBF0;padding:16px;border-radius:12px;margin:20px 0;">
          <p style="margin:0 0 8px;font-weight:600;color:#1E1B4B;">Your Ticket IDs:</p>
          <ul style="list-style:none;padding:0;margin:0;">${ticketList}</ul>
        </div>

        <table style="width:100%;font-size:14px;color:#475569;">
          <tr><td>Visitors</td><td style="text-align:right;font-weight:600;">${booking.adults} Adults${booking.kidsUnder3 > 0 ? ", " + booking.kidsUnder3 + " Kids" : ""}</td></tr>
          <tr><td>Rate</td><td style="text-align:right;">₹${booking.rate}/person</td></tr>
          <tr><td style="font-weight:700;color:#1E1B4B;">Total Paid</td><td style="text-align:right;font-weight:700;color:#1E1B4B;">₹${booking.total}</td></tr>
          <tr><td>Payment ID</td><td style="text-align:right;font-family:monospace;font-size:12px;">${paymentId}</td></tr>
        </table>

        <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;" />

        <p style="color:#475569;font-size:13px;">
          <strong>How to enter:</strong> Show the QR code on your ticket at the park entrance.
          You can download your PDF tickets from the booking confirmation page.
        </p>

        <p style="color:#475569;font-size:13px;margin-top:20px;">
          Address: RMMV+MF3, New Moradabad, Chaudharpur, Moradabad, UP 244102<br/>
          Phone: +91 98765 43210
        </p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: booking.email,
    subject: subject,
    htmlBody: htmlBody,
  });
}

// ─── Helpers ─────────────────────────────────────────────────
function getOrCreateSheet(visitDate) {
  var sheetName = visitDate || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [
      "Ticket IDs", "Booking Timestamp", "Visit Date", "Name", "Phone",
      "Email", "Adults", "Kids Under 3", "Rate", "Total Amount",
      "Day Type", "Status", "Payment ID",
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, 13);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1E1B4B");
    headerRange.setFontColor("#FACC15");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    for (var i = 1; i <= 13; i++) sheet.autoResizeColumn(i);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
