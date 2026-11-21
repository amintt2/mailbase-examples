import { randomUUID } from "node:crypto";
import WelcomeForm from "./welcome-form";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main>
      <h1>Send a welcome email</h1>
      <p>A Server Action calls <code>POST https://mailbase.studio/api/v1/send</code>.</p>
      <WelcomeForm idempotencyKey={`welcome-${randomUUID()}`} />
    </main>
  );
}
