// One-off send: node send.js you@example.com
import { sendEmail } from "./mailbase.js";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node send.js <recipient@example.com>");
  process.exit(2);
}

const result = await sendEmail({
  idempotencyKey: `hello-${to}-${new Date().toISOString().slice(0, 10)}`,
  to,
  subject: "Hello from the Mailbase API",
  html: "<p>It works. This email was sent with one <code>fetch</code> call.</p>",
  text: "It works. This email was sent with one fetch call.",
  transactional: true,
});

console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
