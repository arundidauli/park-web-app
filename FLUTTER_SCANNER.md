# Flutter Entry Scanner App

Entry validation app for park staff (entry boys). Scans QR codes on visitor tickets to verify payment and grant entry.

## Purpose

- Entry boy at the park gate scans the QR code printed on each ticket PDF
- App calls the booking API to validate the ticket
- Shows: visitor name, visit date, ticket status (valid / already used / not found)
- Marks ticket as "Used" after successful scan so it can't be reused

## API Endpoints

The scanner calls the same backend API used by the booking frontend.

### Validate ticket (GET)

```
GET /api/validate?ticketId=AJ-XXXXXXXX-01&date=2026-07-25
```

**Query params:**
- `ticketId` (required) — e.g. `AJ-6FPHYZ-01`
- `date` (optional) — visit date in `YYYY-MM-DD` format. Speeds up search (only searches that day's sheet).

**Response (success):**
```json
{
  "valid": true,
  "ticketId": "AJ-6FPHYZ-01",
  "name": "Ravi Kumar",
  "date": "2026-07-25",
  "message": "Entry granted"
}
```

**Response (failure):**
```json
{
  "valid": false,
  "ticketId": "AJ-6FPHYZ-01",
  "reason": "Ticket already used"
}
```

**Possible reasons:**
- `Ticket not found` — invalid ID or wrong date sheet
- `Ticket already used` — already scanned and marked Used
- `Ticket not confirmed` — status is not "Confirmed" (e.g. Cancelled)

### Validate via Apps Script (production)

```
GET <APPS_SCRIPT_URL>?action=validate&ticketId=AJ-XXXXXXXX-01
```

Same response format. Searches all worksheets (no date filter in Apps Script).

## Flutter App Structure

```
lib/
  main.dart                 # App entry, theme, routing
  screens/
    scan_screen.dart        # Camera view + scan logic
    result_screen.dart      # Scan result display
  services/
    api_service.dart        # HTTP calls to backend / Apps Script
  models/
    validation_result.dart  # Response model
  widgets/
    scan_overlay.dart       # Camera overlay UI
```

## Key Features

1. **Camera QR scanner** — uses `mobile_scanner` package for fast QR detection
2. **Auto-validate** — on scan, immediately calls API
3. **Result screen** — shows name, date, status with color:
   - Green checkmark = Entry granted (valid ticket)
   - Orange warning = Already used
   - Red X = Not found / invalid
4. **Sound feedback** — beep on valid scan, error tone on invalid
5. **Scan history** — local list of recent scans for reference
6. **Manual entry** — type ticket ID manually if QR is damaged

## Packages

```yaml
dependencies:
  mobile_scanner: ^5.0.0     # QR code scanning
  http: ^1.2.0               # API calls
  permission_handler: ^11.0.  # Camera permission
  audioplayers: ^6.0.0        # Scan sounds
```

## Setup

1. Create new Flutter project: `flutter create park_scanner`
2. Copy `lib/` structure from this doc
3. Set API URL in app config:
   - Local: `http://<your-ip>:8000`
   - Production: Apps Script web app URL
4. `flutter run` on device (camera required — won't work on emulator)

## Device Requirements

- Android 6.0+ or iOS 13+
- Working rear camera
- Internet connectivity (to reach backend/API)

## Notes

- Ticket IDs follow format: `AJ-XXXXXX-NN` where `AJ-XXXXXX` is booking ID and `NN` is ticket number (01, 02, etc.)
- Each booking generates multiple tickets (adults + kids under 3), each with a unique QR code
- The QR code content is the full ticket ID (e.g. `AJ-6FPHYZ-01`)
- Scanning any ticket ID from a booking validates that specific guest — not the whole booking
- After valid scan, ticket status changes to "Used" in the Google Sheet permanently
