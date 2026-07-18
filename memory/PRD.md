# 7 Ajoobe Park — Ticket Booking SPA

## Original problem statement
Modern, responsive, conversion-optimized single-page web app for 7 Ajoobe Park (7 अजूबे पार्क), Moradabad — a M.D.A. × Zing Parks initiative. Bilingual (Hindi + English), Awwwards-level polish, kinetic hero, dynamic ticket booking with weekday/weekend pricing, simulated QR payment success.

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis (smooth scroll) + shadcn UI (Dialog, Calendar, Popover, Input) + sonner (toasts) + react-qr-code.
- Backend: unchanged FastAPI template (no persistence per user choice).
- Storage: frontend-only, no backend calls beyond template default.
- Data: `src/lib/data.js` holds park info + wonders + price logic (`isWeekend(date)`).

## User personas
- Moradabad family booking a day-trip
- Solo/couple visitors wanting to skip counter queues

## Core requirements (static)
- Bilingual copy (Hindi + English) throughout
- Dynamic pricing: Mon–Fri ₹50/person, Sat/Sun ₹100/person, kids <3 always FREE
- Live-updating total in booking summary
- Simulated payment → success modal with QR code & ticket ID
- Pricing table matches official rates exactly
- T&Cs (non-refundable, one-day-one-visit, admission-reserved)
- Full address + map iframe + phone + email footer

## What's implemented (Dec 2025)
- Kinetic hero with masked line-by-line Hindi reveal + floating parallax wonder cards
- Editorial marquee (bilingual, infinite scroll)
- Numbered manifesto chapters (01–03)
- Bento-grid Wonders gallery (7 real images)
- Full booking flow: date picker, counters, validated inputs, live rate badge, live ₹ total, simulated payment (1.2s), success modal with QR + ticket ID + toast
- Official pricing table (Weekday / Weekend + Public Holidays column)
- Terms & Conditions cards on indigo
- Footer with embedded Google Maps iframe, socials, contact
- Lenis smooth scrolling + framer-motion scroll reveals

## Prioritized backlog
- P1: Backend booking persistence + email confirmation via Resend
- P1: Real Stripe/Razorpay integration
- P2: Admin dashboard to view/export bookings
- P2: Multi-language toggle (add EN-only mode)
- P2: Real park photography (drone shots) for hero
- P3: Group/school-trip pricing tier + coupons

## Next tasks
- Ask user whether to hook up MongoDB persistence + Resend confirmation email
- Consider Stripe test integration if user wants a real checkout demo
