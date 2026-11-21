// The whole "SDK": one fetch call to POST /api/v1/send.
const API_URL = process.env.MAILBASE_API_URL || "https://mailbase.studio";

export async function sendEmail({ idempotencyKey, ...email }) {
  const apiKey = process.env.MAILBASE_API_KEY;
  if (!apiKey) throw new Error("Set MAILBASE_API_KEY (Settings -> API & webhooks in Mailbase).");

  const res = await fetch(`${API_URL}/api/v1/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Same key + same body on a retry = recipients already accepted are not mailed again.
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(email),
  });

  const data = await res.json().catch(() => ({}));
  if (res.status !== 202) {
    // 400 bad body, 401/403 key, 409 held for review or key reused with another body,
    // 422 blocked by scam screening, 429 quota or rate limit (see Retry-After), 503 not set up.
    const err = new Error(data?.error?.message || data?.error || `Mailbase answered ${res.status}`);
    err.status = res.status;
    err.retryAfter = res.headers.get("retry-after");
    throw err;
  }
  // { ok, campaignId, sent: [{ id, email, status, ... }], failed: [{ email, status, error, ... }] }
  return data;
}
