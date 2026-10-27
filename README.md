# Tickets to Thrill - MERN Edition

The same project, same title, same features as the original PHP/MySQL app -
rebuilt as a **MERN stack** app (MongoDB, Express, React, Node.js) with a
brand new **"Neon Carnival"** dark theme in place of the original light
cream/poster look.

## What's the same

- Public site: Home, Ticket catalog, About, Contact
- Accounts: register, login (with attempt-throttling lockout), profile edit,
  password change
- Cart -> choose a visit date -> simulated payment -> instant PDF e-ticket
  (download + emailed)
- My Account: booking history (with visit date), cancel an upcoming booking
  (shows a refund message), re-pay a pending order
- Admin panel: dashboard stats, manage users (promote/demote/delete), manage
  every booking's status (with the same refund message when cancelling),
  read/manage contact messages
- The same ticket-PDF design (branded header, order card, passes table,
  perforated tear line, admission stub) - recolored for the new theme and
  rebuilt with PDFKit instead of hand-rolled PDF operators

## Visit date & refunds

At checkout, the visitor picks the date they plan to come to the park -
it's stored on the order, shown on the PDF ticket, and used to work out a
simulated refund when a booking is cancelled:

- cancelled 24h+ before the visit date -> full refund
- cancelled within 24h of the visit date -> 50% refund
- cancelled after the visit date has passed -> no refund

No real payment gateway is wired up, so this only *calculates and displays*
the refund amount/message - it doesn't move any actual money. The logic
lives in `server/src/utils/refund.js` and is shared by both the customer's
own cancel action and the admin's booking-status control.

## What's different

- **Stack**: Node.js/Express + MongoDB (Mongoose) instead of PHP + MySQL;
  React (Vite) instead of server-rendered PHP pages
- **Theme**: a dark, glowing "Neon Carnival" look (pink/cyan/yellow/purple on
  near-black) instead of the original cream fairground-poster theme -
  entirely contained in `client/src/styles/theme.css`
- **Auth**: JWT bearer tokens instead of PHP sessions
- **Cart**: lives in the browser (localStorage) via React Context, then
  validated and priced server-side at checkout - instead of a PHP session
  cart

## Project layout

```
mern/
  server/   Express + MongoDB API
  client/   React (Vite) frontend
```

## Ticket catalog

The seeded ticket catalog (`server/src/data/ticketCatalog.js`) is a direct
port of the original PHP app's catalog (`data/tickets.php`) - the same 14
tickets, prices, descriptions, bullets, badges and "was" discount pricing,
grouped the same way into Individual / Combo / Limited-Time Offers.

## Requirements

- Node.js 18+
- A MongoDB server - either a local `mongod`, or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (just paste its
  connection string into `MONGO_URI`)

## How to run

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env - at minimum set MONGO_URI to your MongoDB connection string
npm install
npm start
```

The API listens on `http://localhost:5000` by default. On first successful
connection it automatically seeds:
- a default ticket catalog
- a default admin account (see below)

The server is intentionally forgiving about MongoDB not being reachable
yet - it will still start and answer `GET /api/health`, but every
database-backed route will return an error until `MONGO_URI` is correct and
reachable.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api/*` requests to
the backend on port 5000 (see `vite.config.js`), so no CORS setup is needed
locally.

### 3. Production build

```bash
cd client
npm run build   # outputs static files to client/dist
```

Serve `client/dist` with any static host, and point it at your deployed API
(update the axios baseURL / add a reverse-proxy rule for `/api`).

## Default admin access

```
Email:    admin@ticketstothrill.example
Password: Admin@123
```

Change `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env` before first run
if you want different seeded credentials, and change the password (or
promote your own account and delete the seeded one from Admin -> Users)
before deploying anywhere real.

## Email delivery

`server/.env` has empty `SMTP_*` fields by default. Without real SMTP
credentials, the confirmation email is **logged to the server console**
instead of actually sent - checkout and the PDF download still work fine
either way. Fill in `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` to
send real email via any SMTP provider.

## Notes on the cart

Unlike the original PHP app (which kept the cart in a server-side session),
this version keeps the cart in the browser via `localStorage` and only talks
to the server at checkout, where every price is re-looked-up from the
database - the server never trusts a price sent by the client.
