# Mailbase API examples

Minimal, runnable examples of sending a **transactional email** with the
[Mailbase](https://mailbase.studio) REST API. Each one is a single HTTP call:
no SDK to install.

| Example | Stack | What it shows |
| --- | --- | --- |
| [`nextjs-app-router/`](nextjs-app-router/) | Next.js 15, Server Action | A form that sends a welcome email; the API key stays on the server |
| [`node-express/`](node-express/) | Node 22, Express 5, `fetch` | A receipt endpoint plus a one-off `send.js` script |
| [`python-requests/`](python-requests/) | Python 3, `requests` | A command-line `send.py` |

## The request

```http
POST https://mailbase.studio/api/v1/send
Authorization: Bearer mb_live_...
Idempotency-Key: receipt-4821
Content-Type: application/json

{
  "to": "ada@example.com",
  "subject": "Your receipt #4821",
  "html": "<p>Thanks for your order.</p>",
  "text": "Thanks for your order.",
  "transactional": true
}
```

- `to`: one address or an array of up to 100 (each recipient gets their own copy).
- `html` and/or `text`, or `templateId` + `mergeValues` to send a template stored in Mailbase.
- `transactional: true` for receipts, password resets and notifications: no unsubscribe
  header, it still reaches people who unsubscribed from your marketing, and it is not held
  back by warm-up or frequency caps. Addresses that bounced or complained are still skipped.
- `senderId` (optional) picks a sender; otherwise the workspace's default sender is used.
- **`Idempotency-Key`**: send one with every request. Retrying with the same key and body
  never mails a recipient twice. Derive it from the business event (`receipt-<orderId>`),
  not from the time of the call.

A processed request answers **202**:

```json
{
  "ok": true,
  "campaignId": "…",
  "sent": [{ "id": "…", "email": "ada@example.com", "providerMsgId": "…", "status": "sent", "sentAt": "…" }],
  "failed": []
}
```

`ok` is `true` only when nothing failed. Entries in `failed` have a `status`:
`suppressed`, `deferred` (with `retryAt`), `failed`, or `unknown` (do not resend with a new key).

| Status | Meaning |
| --- | --- |
| 400 | Invalid body |
| 401 / 403 | Missing or revoked key, or no `email:send` scope |
| 409 | Held for review by scam screening (retry later with the same key), or a key reused with a different body |
| 422 | Blocked by scam screening |
| 429 | Monthly quota, daily limit or API rate limit; `Retry-After` says when |
| 503 | No sending set up for the workspace yet |

Full reference: [mailbase.studio/docs/api](https://mailbase.studio/docs/api) ·
Quickstart: [mailbase.studio/docs/send-transactional-email](https://mailbase.studio/docs/send-transactional-email)

> **Transactional-first endpoint:** Mailbase also exposes `POST https://mailbase.studio/api/v1/emails`, which is transactional by default and adds `from`, `reply_to`, `cc`, `bcc`, custom `headers`, and base64 `attachments`. `/api/v1/send` remains fully supported.

## Before you run them

1. Create a Mailbase workspace and verify a sending domain (Settings → Domains & health).
   Mailbase shows the SPF, DKIM and DMARC records to publish. Add a sender address on it and
   make it the default.
2. Create an API key with the `email:send` scope (Settings → API & webhooks). Keep it in your
   backend's environment, never in browser or mobile code.
3. `cp .env.example .env` in the example folder and paste the key.

Every example also reads `MAILBASE_API_URL` (default `https://mailbase.studio`) so you can
point it at a mock server in tests.

The API is HTTP only; there is no SMTP relay.

## Pricing

Free plan: 200 emails a month, no card. Sending from your own verified domain on the free
plan needs a verified card (nothing is charged) and allows 3,000 emails a month.
Paid plans, billed yearly: Starter €9/month for 50,000 emails a month, Growth €29/month for
100,000, Scale €79/month for 300,000 (excl. VAT).
Details: [mailbase.studio/features/transactional-email](https://mailbase.studio/features/transactional-email) ·
Compare monthly volume costs: [Email API pricing calculator](https://mailbase.studio/tools/email-api-pricing-calculator).

## Related

- [mailbase-cli](https://github.com/amintt2/mailbase-cli): `mailbase send --to ... --transactional --idempotency-key ...`
- [mailbase-mcp](https://github.com/amintt2/mailbase-mcp): use Mailbase from Claude, Cursor or Codex
- [email-dns-check](https://github.com/amintt2/email-dns-check): check SPF, DKIM, DMARC and MX before you send

## License

MIT
