import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import gspread
from google.oauth2.service_account import Credentials
from pathlib import Path
from datetime import datetime

# ── Config ───────────────────────────────────────────────────
SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID", "1Hbhv3HfWHfuzru-6aSDjO3qghfo8h6Jr62Zs_cMoldc")
SERVICE_ACCOUNT_FILE = Path(__file__).parent / "service-account.json"

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

creds = Credentials.from_service_account_file(str(SERVICE_ACCOUNT_FILE), scopes=SCOPES)
gc = gspread.authorize(creds)

# ── Open spreadsheet ─────────────────────────────────────────
if not SPREADSHEET_ID:
    print("\n⚠️  Set SPREADSHEET_ID in your environment:")
    print("   export SPREADSHEET_ID=your_sheet_id_here")
    print("\n   Trying to open first accessible spreadsheet...\n")
    try:
        spreadsheet = gc.open("7 Ajoobe Park Bookings")
    except gspread.SpreadsheetNotFound:
        sheets = gc.openall()
        if sheets:
            spreadsheet = sheets[0]
            print(f"Found existing sheet: {spreadsheet.title} ({spreadsheet.url})")
        else:
            print("ERROR: No spreadsheets found. Create one and share with:")
            print(f"  {creds.service_account_email}")
            exit(1)
else:
    spreadsheet = gc.open_by_key(SPREADSHEET_ID)

print(f"Using spreadsheet: {spreadsheet.url}")

# ── Settings sheet ───────────────────────────────────────────
SETTINGS_SHEET = "settings"
SETTINGS_HEADERS = ["Key", "Value", "Notes"]

DEFAULT_SETTINGS = [
    ["park_open", "true", "Set to 'false' to close park for all dates"],
    ["booking_hold_enabled", "true", "Allow bookings to be placed on hold"],
]


def get_or_create_settings():
    """Get or create the settings sheet."""
    try:
        ws = spreadsheet.worksheet(SETTINGS_SHEET)
    except gspread.WorksheetNotFound:
        ws = spreadsheet.add_worksheet(title=SETTINGS_SHEET, rows=50, cols=3)
        ws.update("A1", [SETTINGS_HEADERS])
        ws.format("A1:C1", {
            "backgroundColor": {"red": 0.118, "green": 0.106, "blue": 0.294},
            "textFormat": {
                "foregroundColor": {"red": 0.98, "green": 0.8, "blue": 0.08},
                "bold": True, "fontSize": 11,
            },
            "horizontalAlignment": "CENTER",
        })
        ws.freeze(rows=1)
        # Add default settings
        for row in DEFAULT_SETTINGS:
            ws.append_row(row, value_input_option="USER_ENTERED")
        # Add holiday section header
        ws.append_row(["", "", ""], value_input_option="USER_ENTERED")
        ws.append_row(["# HOLIDAYS", "Add dates below", "Format: holiday:YYYY-MM-DD"], value_input_option="USER_ENTERED")
        print("Created 'settings' sheet with defaults")
    return ws


def read_settings():
    """Read settings from the settings sheet into a dict."""
    ws = get_or_create_settings()
    data = ws.get_all_values()

    holidays = []
    config = {}

    for row in data[1:]:  # skip header
        if len(row) < 2:
            continue
        key = row[0].strip()
        value = row[1].strip()

        if not key:
            continue

        # Holiday entries: key = "holiday:2026-08-15", value = "Independence Day" or "true"
        if key.startswith("holiday:"):
            date_str = key.split(":", 1)[1].strip()
            reason = value if value and value != "true" else "Holiday"
            holidays.append({"date": date_str, "reason": reason})
        elif key.startswith("#"):
            continue  # comment row
        else:
            config[key] = value

    return {"holidays": holidays, "config": config}


# ── Booking headers ──────────────────────────────────────────
HEADERS = [
    "Ticket IDs", "Booking Timestamp", "Visit Date", "Name", "Phone",
    "Email", "Adults", "Kids Under 3", "Rate", "Total Amount",
    "Day Type", "Status", "Payment ID",
]


def get_sheet_for_date(visit_date: str):
    """Get or create a daily worksheet named by visit date (e.g. '2026-07-25')."""
    try:
        return spreadsheet.worksheet(visit_date)
    except gspread.WorksheetNotFound:
        ws = spreadsheet.add_worksheet(title=visit_date, rows=500, cols=13)
        ws.update("A1", [HEADERS])
        ws.format("A1:M1", {
            "backgroundColor": {"red": 0.118, "green": 0.106, "blue": 0.294},
            "textFormat": {
                "foregroundColor": {"red": 0.98, "green": 0.8, "blue": 0.08},
                "bold": True, "fontSize": 11,
            },
            "horizontalAlignment": "CENTER",
        })
        ws.freeze(rows=1)
        print(f"Created worksheet '{visit_date}'")
        return ws


# ── FastAPI ──────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BookingRequest(BaseModel):
    bookingId: str
    date: str
    name: str
    phone: str
    email: str
    adults: int
    kidsUnder3: int
    rate: int
    total: int
    dayType: str
    status: str = "Confirmed"  # "Confirmed" or "Hold"


@app.get("/")
def root():
    return {"status": "ok", "spreadsheet": spreadsheet.url}


@app.get("/api/settings")
def get_settings():
    """Return holidays and park config for the frontend."""
    return read_settings()


@app.post("/api/bookings")
def create_booking(b: BookingRequest):
    # Validate status
    if b.status not in ("Confirmed", "Hold"):
        raise HTTPException(status_code=400, detail="Status must be 'Confirmed' or 'Hold'")

    # Check if park is closed globally
    settings = read_settings()
    park_open = settings["config"].get("park_open", "true").lower()
    if park_open != "true":
        raise HTTPException(status_code=400, detail="Park is currently closed. Bookings not accepted.")

    # Check if date is a holiday
    holiday_dates = [h["date"] for h in settings["holidays"]]
    if b.date in holiday_dates:
        reason = next((h["reason"] for h in settings["holidays"] if h["date"] == b.date), "Holiday")
        raise HTTPException(status_code=400, detail=f"Park is closed on {b.date} — {reason}")

    total_tickets = b.adults + b.kidsUnder3
    ticket_ids = [f"{b.bookingId}-{str(i+1).zfill(2)}" for i in range(total_tickets)]

    ws = get_sheet_for_date(b.date)

    row = [
        ", ".join(ticket_ids),
        datetime.utcnow().isoformat(),
        b.date,
        b.name,
        b.phone,
        b.email,
        b.adults,
        b.kidsUnder3,
        b.rate,
        b.total,
        b.dayType,
        b.status,
        "DEMO-" + b.bookingId,
    ]

    ws.append_row(row, value_input_option="USER_ENTERED")

    print(f"✅ Booking saved: {b.name} | {b.bookingId} | {total_tickets} tickets | ₹{b.total} | {b.status} → {b.date}")

    return {
        "success": True,
        "ticketIds": ticket_ids,
        "status": b.status,
        "spreadsheet": spreadsheet.url,
    }


@app.get("/api/validate")
def validate_ticket(ticketId: str, date: str = ""):
    if date:
        try:
            ws_list = [spreadsheet.worksheet(date)]
        except gspread.WorksheetNotFound:
            return {"valid": False, "reason": "Ticket not found", "ticketId": ticketId}
    else:
        ws_list = spreadsheet.worksheets()

    for ws in ws_list:
        data = ws.get_all_values()
        for i, row in enumerate(data[1:], start=2):
            ticket_ids_cell = row[0] if row else ""
            if ticketId in ticket_ids_cell:
                status = row[11] if len(row) > 11 else ""
                if status == "Used":
                    return {"valid": False, "reason": "Ticket already used", "ticketId": ticketId}
                if status == "Hold":
                    return {"valid": False, "reason": "Booking on hold — not confirmed yet", "ticketId": ticketId}
                if status != "Confirmed":
                    return {"valid": False, "reason": "Ticket not confirmed", "ticketId": ticketId}
                ws.update_cell(i, 12, "Used")
                return {
                    "valid": True,
                    "ticketId": ticketId,
                    "name": row[3],
                    "date": row[2],
                    "message": "Entry granted",
                }

    return {"valid": False, "reason": "Ticket not found", "ticketId": ticketId}


if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀 Server running at http://localhost:8000")
    print(f"   Service account: {creds.service_account_email}\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
