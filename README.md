# 7 Ajoobe Park — Ticket Booking

Bilingual (Hindi + English) single-page ticket booking app for 7 Ajoobe Park, Moradabad.

## Stack

- React 19 + Tailwind CSS + Framer Motion + Lenis smooth scroll
- shadcn/ui components (new-york style, JS not TS)
- jsPDF + qrcode for PDF ticket generation
- Razorpay for payments (production)
- Google Sheets via Apps Script for booking storage (production)
- FastAPI + gspread for local dev backend
- Flutter (separate repo) for entry scanner app

## Google Sheets Integration (Production)

No backend — bookings POST directly from the browser to Google Apps Script.

### Setup

1. Create a Google Sheet
2. Extensions > Apps Script > paste contents of `google-apps-script.gs`
3. Project Settings > Script Properties: add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
4. Deploy > New deployment > **Web app** (Execute as: Me, Who has access: Anyone)
5. Copy Web App URL
6. Create `frontend/.env`:
   ```
   REACT_APP_SHEETS_URL=your_web_app_url_here
   ```

### Sheet structure

- **Daily worksheets** named by visit date (e.g. `2026-07-25`)
- 13 columns: Ticket IDs, Booking Timestamp, Visit Date, Name, Phone, Email, Adults, Kids Under 3, Rate, Total Amount, Day Type, Status, Payment ID
- Status values: Confirmed (green) / Used (orange) / Cancelled (red)
- Frozen header row, indigo background + yellow text

## Local Development (FastAPI backend)

```bash
# Backend
cd backend
pip install -r requirements.txt
# Place service-account.json (Google service account) in backend/
python3 server.py
# Runs on http://localhost:8000

# Frontend
cd frontend
npm install --legacy-peer-deps
# Create frontend/.env with REACT_APP_API_URL=http://localhost:8000
npm run start
```

## PDF Tickets

- One PDF per booking with summary page + individual ticket pages
- Each ticket has: ticket ID, visitor name, date, guest type, price, QR code
- PDF opens in browser tab (webview), not auto-downloaded

## Razorpay Payment

- Production: order created server-side via Apps Script, Razorpay checkout.js in `index.html`
- Local dev: bypass mode (`REACT_APP_BYPASS_PAYMENT=true` or no `REACT_APP_SHEETS_URL`)
- Server-side signature verification before saving to sheet

## Entry Scanner (Flutter)

Separate Flutter app for entry boys at the park gate. See `FLUTTER_SCANNER.md`.

## Deploy to Vercel

1. Push to GitHub
2. Connect repo on vercel.com
3. Framework: **Create React App**, Root directory: **frontend**
4. Add env vars in Vercel dashboard
