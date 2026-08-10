# Kahe — Campus Super App (Hackathon Build)

A modular campus app. This build focuses on the **Canteen Pre-order + Secure QR Pickup**
feature end-to-end, with Announcements, Bus Tracking, and Student Status as working
prototype modules.

## Stack
- Backend: Node.js + Express + SQLite (`better-sqlite3`, zero setup, single file DB)
- Frontend: Plain HTML/CSS/JS (no build step, works in any browser on any device)
- Auth: JWT (shared across all modules)
- QR: `qrcode` (generation) + `html5-qrcode` via CDN (scanning, no install needed)

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`. Open it in a browser.

## Demo logins
(seeded automatically on first run)

| Role    | Email                | Password    |
|---------|-----------------------|-------------|
| Student | student@college.edu   | password123 |
| Staff   | staff@college.edu     | password123 |
| Admin   | admin@college.edu     | password123 |

## Demo flow (canteen)
1. Log in as **student** → Canteen → add items to cart → Place Order
2. Click **Pay Now (Mock)** → QR code appears
3. Open a second browser/tab (or another device), log in as **staff**
4. Go to **Staff Tools → Open Pickup Scanner**
5. Scan the student's QR (or paste the token manually) → order marked picked up
6. Student's checkout page auto-updates to "picked up" (polling)

## Security design (talking points for judges)

**Problem with naive QR pickup systems:** if the QR just encodes something like
`orderId=45`, anyone can screenshot it, share it, or guess sequential IDs to
generate a fake one.

**What this build does instead:**
- QR encodes a **signed JWT** (`QR_SECRET`), not a raw ID — can't be forged without the server's key
- Token has a **20-minute expiry** baked into the JWT itself
- Each token carries a **`jti` (unique token ID)** stored server-side against the order;
  once redeemed, order status flips to `picked_up` and any repeat scan is rejected
  (**replay protection**)
- `/api/canteen/verify` is **staff/admin-role gated** — students can't call it
- Passwords hashed with bcrypt, never stored in plain text
- JWT auth shared across all modules — one login, consistent authorization checks
  on every route (`requireAuth`, `requireRole`)

**What's mocked for the hackathon, and why:**
- Payment is a simulated success (`/api/canteen/orders/:id/pay`) — swappable with
  a real gateway's test mode (Razorpay/Stripe). Real integration would add
  webhook signature verification and idempotency keys to prevent double-charging.
- Bus tracking ETA is simulated server-side (counts down / resets) as a placeholder
  for a real GPS feed.

## Project structure
```
kahe/
├── server/
│   ├── index.js              Express app entrypoint
│   ├── db.js                 SQLite schema + seed data
│   ├── middleware/auth.js    JWT auth + role checks
│   └── routes/
│       ├── auth.js           login/register/me
│       ├── canteen.js        menu, orders, mock pay, QR sign/verify
│       ├── announcements.js  post/list announcements
│       ├── bus.js            simulated live bus ETA
│       └── student.js        attendance/fee/library status
└── public/                   plain HTML/CSS/JS frontend
    ├── login.html, index.html (dashboard)
    ├── shared/                auth.js (JWT/fetch helper), style.css
    ├── canteen/               menu.html, checkout.html, scanner.html
    ├── announcements/
    ├── bus/
    └── student/
```

## Notes / next steps
- Add rate-limiting on `/api/canteen/orders` to stop pickup-slot abuse
- Add admin UI for posting announcements (endpoint already exists, role-gated)
- Real GPS integration for bus tracking
- Push notifications for order-ready / bus-arriving
