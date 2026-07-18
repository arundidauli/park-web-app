import jsPDF from "jspdf";
import QRCode from "qrcode";

const BRAND = {
  indigo: [30, 27, 75],
  yellow: [250, 204, 21],
  teal: [13, 148, 136],
  orange: [234, 88, 12],
  cream: [255, 251, 240],
  white: [255, 255, 255],
};

async function addTicketPage(doc, ticket, pageIndex, totalPages) {
  // Background
  doc.setFillColor(...BRAND.indigo);
  doc.roundedRect(0, 0, 90, 55, 0, 0, "F");

  // Yellow accent bar
  doc.setFillColor(...BRAND.yellow);
  doc.rect(0, 0, 3, 55, "F");

  // Ticket ID
  doc.setTextColor(...BRAND.yellow);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TICKET ID", 7, 8);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(ticket.id, 7, 15);

  // Page indicator
  doc.setFontSize(6);
  doc.setTextColor(180, 180, 200);
  doc.text(`Ticket ${pageIndex} of ${totalPages}`, 7, 19);

  // Divider
  doc.setDrawColor(...BRAND.yellow);
  doc.setLineWidth(0.3);
  doc.line(7, 21, 58, 21);

  // Visitor
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("VISITOR", 7, 26);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(ticket.name, 7, 32);

  // Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("VISIT DATE", 7, 38);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(ticket.date, 7, 43);

  // Guest type
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("GUEST TYPE", 7, 49);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(ticket.isKid ? "Kid under 3 (FREE)" : "Adult", 7, 53.5);

  // QR code
  const qrDataUrl = await QRCode.toDataURL(ticket.id, {
    width: 200,
    margin: 1,
    color: { dark: "#1E1B4B", light: "#FFFFFF" },
  });
  doc.addImage(qrDataUrl, "PNG", 60, 5, 26, 26);

  doc.setTextColor(...BRAND.yellow);
  doc.setFontSize(6);
  doc.text("SCAN AT ENTRY", 62, 34);

  doc.setTextColor(200, 200, 220);
  doc.setFontSize(5.5);
  doc.text("7 Ajoobe Park, Moradabad", 62, 39);

  // Per-person price
  doc.setTextColor(...BRAND.yellow);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(ticket.isKid ? "PRICE" : "PAID", 62, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(ticket.isKid ? "FREE" : "\u20B9" + ticket.rate, 62, 51);
}

function addSummaryPage(doc, booking, totalTickets) {
  doc.setFillColor(...BRAND.indigo);
  doc.roundedRect(0, 0, 90, 55, 0, 0, "F");

  doc.setFillColor(...BRAND.yellow);
  doc.rect(0, 0, 3, 55, "F");

  // Title
  doc.setTextColor(...BRAND.yellow);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("7 AJOOBE PARK", 7, 10);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Booking Confirmation", 7, 15);

  // Divider
  doc.setDrawColor(...BRAND.yellow);
  doc.setLineWidth(0.3);
  doc.line(7, 17, 83, 17);

  // Booking ID
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(7);
  doc.text("BOOKING ID", 7, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.yellow);
  doc.text(booking.bookingId, 7, 28);

  // Details
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  doc.text("Name", 7, 34);
  doc.setFont("helvetica", "bold");
  doc.text(booking.name, 30, 34);

  doc.setFont("helvetica", "normal");
  doc.text("Date", 7, 39);
  doc.setFont("helvetica", "bold");
  doc.text(booking.date, 30, 39);

  doc.setFont("helvetica", "normal");
  doc.text("Phone", 7, 44);
  doc.setFont("helvetica", "bold");
  doc.text(booking.phone, 30, 44);

  // Guest breakdown
  doc.setFont("helvetica", "normal");
  doc.text("Guests", 7, 49);
  doc.setFont("helvetica", "bold");
  const guestLine = booking.adults + " Adult" + (booking.adults > 1 ? "s" : "")
    + (booking.kidsUnder3 > 0 ? " + " + booking.kidsUnder3 + " Kid" + (booking.kidsUnder3 > 1 ? "s" : "") + " (Free)" : "");
  doc.text(guestLine, 30, 49);

  // Total
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL PAID", 55, 34);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.yellow);
  doc.text("\u20B9" + booking.total, 55, 42);

  // Bottom note
  doc.setTextColor(180, 180, 200);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.text("Show this QR at the park entrance.", 7, 53.5);
}

export async function downloadTickets(booking) {
  const totalTickets = booking.adults + booking.kidsUnder3;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [90, 55] });

  // Page 1: Summary
  addSummaryPage(doc, booking, totalTickets);

  // Pages 2+: Individual tickets
  for (let i = 1; i <= totalTickets; i++) {
    doc.addPage([90, 55], "landscape");
    const ticketId = booking.bookingId + "-" + String(i).padStart(2, "0");
    const isKid = i > booking.adults;

    await addTicketPage(doc, {
      id: ticketId,
      name: booking.name,
      date: booking.date,
      isKid,
      rate: isKid ? 0 : booking.rate,
    }, i, totalTickets);
  }

  // Open PDF in new tab (webview) instead of downloading
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");

  return Array.from({ length: totalTickets }, (_, i) =>
    booking.bookingId + "-" + String(i + 1).padStart(2, "0")
  );
}
