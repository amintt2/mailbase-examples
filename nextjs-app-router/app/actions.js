"use server";

// Server Action: runs on the server only, so MAILBASE_API_KEY never reaches the browser.
const API_URL = process.env.MAILBASE_API_URL || "https://mailbase.studio";

export async function sendWelcomeEmail(_prev, formData) {
  const email = String(formData.get("email") || "").trim();
  // Generated once per rendered form: a double submit or a retry sends one email, not two.
  const idempotencyKey = String(formData.get("idempotencyKey") || "");
  if (!email) return { ok: false, message: "Enter an email address." };

  const res = await fetch(`${API_URL}/api/v1/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILBASE_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      to: email,
      subject: "Welcome aboard",
      html: "<p>Thanks for signing up. Reply to this email if you need anything.</p>",
      text: "Thanks for signing up. Reply to this email if you need anything.",
      transactional: true,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (res.status !== 202) {
    const reason = typeof data.error === "string" ? data.error : data.error?.message;
    return { ok: false, message: `Mailbase answered ${res.status}${reason ? `: ${reason}` : ""}` };
  }
  if (!data.ok) {
    const f = data.failed?.[0];
    return { ok: false, message: `Not sent (${f?.status}): ${f?.error || "see the failed list"}` };
  }
  return { ok: true, message: `Sent to ${email}.` };
}
