## Compliance Dashboard (React + Vite)

This project hosts a GDPR compliance dashboard built with React, React Bootstrap and Vite. It lets users capture GDPR control evidence, generate reports, and print or email receipts via the `Udskriv` screen. A lightweight Node/Express mail API now ships with the repo so collaborators do not need extra tooling.

### Getting started

```bash
npm install
cp .env.example .env   # then fill in SMTP credentials
npm run dev:full        # start Vite + the email server together
npm run build           # optional: create a production build
```

- `npm run email-server` runs only the mail API (useful in production).
- `npm run dev` starts just the Vite client if you have another API host.
- `npm run dev:full`runs mail-server and dev in parallel 

### Emailing the PDF receipt

`Udskriv` still renders the PDF client-side with `html2canvas` and `jspdf`, but now the "Send" button POSTs directly to the bundled Express endpoint at `/api/send-receipt`. Configure the mailer with the `.env` file created:
__________
.env
EMAIL_SERVER_PORT=4000
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_username
EMAIL_PASS=your_password
EMAIL_FROM="Compliance App <noreply@example.com>"
EMAIL_ALLOWED_ORIGINS=http://localhost:5173

# Optional client override (defaults to /api)
VITE_EMAIL_API_BASE=/api
__________

- When SMTP credentials are provided the app will relay mail through that server.
- If credentials are missing the API falls back to Nodemailer's `jsonTransport`, logging the payload in the terminal so teammates can test with zero setup—look for the `Mock email payload` block.
- During development Vite proxies `/api` to `http://localhost:4000`, so front-end fetches work without extra CORS tweaks.

When the UI displays “Serveren kører i mock-mode…”, it means the API returned `mockDelivery=true`, confirming no SMTP transport is configured. Configure the values above (or switch to a provider such as Gmail SMTP, Outlook SMTP, Mailgun, etc.) for real deliveries.

Deployments can host the `server/emailServer.js` script wherever you normally deploy Node services. Set `VITE_EMAIL_API_BASE` to the public base URL (e.g. `https://compliance.example.com/api`) so the built client points to the right origin.

### Tech stack

- React 19 + Vite (Rolldown)
- React Bootstrap for layout
- Supabase Auth + Storage + Edge Functions
- html2canvas + jsPDF for client-side PDF generation
