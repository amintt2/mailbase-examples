"use client";

import { useActionState } from "react";
import { sendWelcomeEmail } from "./actions";

export default function WelcomeForm({ idempotencyKey }) {
  const [state, action, pending] = useActionState(sendWelcomeEmail, null);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required placeholder="ada@example.com" />
      <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send welcome email"}</button>
      {state && <p role="status">{state.message}</p>}
    </form>
  );
}
