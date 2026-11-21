# Next.js (App Router) + Mailbase

A form whose Server Action sends a welcome email through `POST /api/v1/send`.
The API key is read on the server only.

```sh
cp .env.example .env.local     # paste your key (email:send scope)
npm install
npm run dev                    # http://localhost:3000
```

- [`app/actions.js`](app/actions.js): the Server Action and the `fetch` call.
- [`app/page.jsx`](app/page.jsx): renders the form with a fresh `Idempotency-Key`, so a
  double submit sends one email.
