# Node + Express + Mailbase

Plain `fetch` (built into Node 18+), no SDK.

```sh
cp .env.example .env           # paste your key (email:send scope)
npm install

npm run send -- you@example.com            # one-off send
npm start                                  # receipt endpoint on :3000
curl -X POST localhost:3000/orders/1042/receipt \
  -H 'Content-Type: application/json' -d '{"email":"you@example.com"}'
```

- [`mailbase.js`](mailbase.js): `sendEmail()`, the only code that talks to Mailbase.
- [`server.js`](server.js): the receipt uses `receipt-<orderId>` as its `Idempotency-Key`,
  so retrying the endpoint never sends a second receipt.
- [`send.js`](send.js): a one-off script.
