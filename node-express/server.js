// A receipt endpoint: POST /orders/:id/receipt { "email": "ada@example.com" }
import express from "express";
import { sendEmail } from "./mailbase.js";

const app = express();
app.use(express.json());

app.post("/orders/:id/receipt", async (req, res) => {
  const orderId = req.params.id;
  const email = String(req.body?.email || "").trim();
  if (!email) return res.status(400).json({ error: "email is required" });

  try {
    const result = await sendEmail({
      // One receipt per order, however many times this endpoint is retried.
      idempotencyKey: `receipt-${orderId}`,
      to: email,
      subject: `Your receipt for order #${orderId}`,
      html: `<p>Thanks for your order <strong>#${escapeHtml(orderId)}</strong>.</p>`,
      text: `Thanks for your order #${orderId}.`,
      transactional: true,
    });
    res.status(result.ok ? 200 : 502).json(result);
  } catch (err) {
    if (err.retryAfter) res.set("Retry-After", err.retryAfter);
    res.status(err.status === 429 ? 429 : 502).json({ error: err.message });
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
