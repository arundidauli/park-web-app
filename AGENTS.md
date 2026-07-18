# park-web-app

Bilingual (Hindi + English) ticket booking SPA for 7 Ajoobe Park, Moradabad. React 19 + Tailwind, deployed on Vercel. Bookings save to Google Sheets via Apps Script. Flutter scanner app for entry validation.

## Quick commands

```bash
cd frontend
npm install --legacy-peer-deps
npm run start          # dev server on :3000
npx craco build        # production build
npm run test           # jest via craco
```

## Architecture

- **Production** — no backend, pure static SPA on Vercel
- **Local dev** — lightweight FastAPI backend (`backend/server.py`) writes to Google Sheets via service account
- `frontend/src/App.js` — single-page app, all sections inline
- `frontend/src/components/` — section components (Hero, Booking, Pricing, Wonders, etc.)
- `frontend/src/components/ui/` — shadcn/ui primitives (new-york style, JS not TS). Only 5 components: `button`, `calendar`, `dialog`, `input`, `popover`.
- `frontend/src/lib/data.js` — park data, wonders list, `priceForDate()`, `isWeekend()`
- `frontend/src/lib/generateTicket.js` — PDF ticket generator (jsPDF + qrcode), opens in webview
- `google-apps-script.gs` — Google Apps Script for production (Razorpay + booking persistence + email)
- `backend/server.py` — local FastAPI with gspread, service account, daily worksheets

## Google Sheets integration

### Production (Apps Script)

Bookings POST from the browser to a Google Apps Script web app URL.

1. Create a Google Sheet
2. Extensions > Apps Script > paste `google-apps-script.gs`
3. Project Settings > Script Properties: add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
4. Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone)
5. Copy Web App URL → `REACT_APP_SHEETS_URL` in frontend `.env`

### Local dev (FastAPI backend)

1. Place service account JSON at `backend/service-account.json`
2. Share the Google Sheet with the service account email
3. `pip install -r backend/requirements.txt`
4. `cd backend && python3 server.py` (runs on :8000)
5. `REACT_APP_API_URL=http://localhost:8000` in `frontend/.env`

### Sheet structure

- **Daily worksheets** named by visit date (e.g. `2026-07-25`) — easier to find today's bookings
- Headers (13 columns): Ticket IDs, Booking Timestamp, Visit Date, Name, Phone, Email, Adults, Kids Under 3, Rate, Total Amount, Day Type, Status, Payment ID
- Status values: `Confirmed` (green), `Used` (orange), `Cancelled` (red)
- Frozen header row, indigo background + yellow text

## PDF tickets

- Single PDF per booking — summary page + one page per guest
- Each ticket page has: ticket ID, visitor name, date, guest type (Adult / Kid under 3 FREE), per-person price, QR code for entry scan
- PDF opens in browser webview (new tab), not auto-downloaded

## Razorpay payment

- Production: order created server-side via Apps Script (key_secret in Script Properties), Razorpay checkout.js loaded in `index.html`
- Local dev: bypass mode (`REACT_APP_BYPASS_PAYMENT=true` or no `REACT_APP_SHEETS_URL`), saves directly to local backend
- Signature verification server-side before saving to sheet

## Testing

- Frontend: `npm run test` from `frontend/` (craco test).

## Key conventions

- **Icons**: Use `lucide-react` only. No emoji for UI icons.
- **No text-align: center on `.App`** — layout is left-aligned with generous padding.
- **Brand colors** are custom Tailwind tokens: `brand-yellow`, `brand-teal`, `brand-indigo`, `brand-orange`, `brand-cream`, `brand-ink` (defined in `tailwind.config.js`).
- **Fonts**: Outfit (latin display), Khand (hindi display), DM Sans (latin body), Hind (hindi body). Loaded in `index.html` from Google Fonts.
- **Animations**: `framer-motion` throughout, `lenis` for smooth scroll. Marquee animation defined in tailwind config (`animate-marquee`).
- **shadcn config**: `components.json` — style `new-york`, JS not TS, aliases use `@/` prefix resolved via webpack alias in `craco.config.js`.
- **Vercel deploy**: Push to GitHub, connect repo on vercel.com. Framework: CRA, root directory: `frontend`.
