// Vercel serverless function: POST /api/contact
// Receives the contact form (JSON) and emails it to ezzarghani@gmail.com
// through Gmail's SMTP server.
//
// Required environment variables (Vercel → Project → Settings → Environment Variables):
//   SMTP_HOST  smtp.gmail.com
//   SMTP_PORT  465
//   SMTP_USER  ezzarghani@gmail.com
//   SMTP_PASS  a Gmail App Password (https://myaccount.google.com/apppasswords), marked Sensitive
//   MAIL_TO    ezzarghani@gmail.com
// Optional:
//   ALLOWED_ORIGINS  comma-separated list of extra allowed origins

import nodemailer from "nodemailer";

const LIMITS = { name: 100, email: 200, subject: 200, message: 5000 };
const MIN_FILL_MS = 3000;          // humans take longer than 3 s to fill the form
const RATE_WINDOW_MS = 10 * 60e3;  // max 5 messages per IP per 10 min (per instance, best-effort)
const RATE_MAX = 5;
const hits = new Map();

const DEFAULT_ORIGINS = [
  "https://ezzarghani.org",
  "https://www.ezzarghani.org",
  "https://ezzarghani.vercel.app",
];

function allowedOrigin(origin) {
  if (!origin) return true; // same-origin requests from some browsers omit it
  const extra = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if ([...DEFAULT_ORIGINS, ...extra].includes(origin)) return true;
  // Vercel preview deployments of this project
  return /^https:\/\/ezzarghani-[a-z0-9-]+-contactelasrioussamas-projects\.vercel\.app$/.test(origin);
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

// one line, no control characters (prevents header injection), trimmed and capped
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
const cleanBody = (v, max) => String(v ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!allowedOrigin(req.headers.origin)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};

  // Spam traps: hidden honeypot field, and forms submitted impossibly fast.
  // Answer "ok" so bots don't learn they were filtered.
  const filledAt = Number(body._t);
  if (body._gotcha || (filledAt && Date.now() - filledAt < MIN_FILL_MS)) {
    return res.status(200).json({ ok: true });
  }

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Too many messages. Please try again later." });
  }

  const first = clean(body.first_name, LIMITS.name);
  const last = clean(body.last_name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const subject = clean(body.subject, LIMITS.subject);
  const message = cleanBody(body.message, LIMITS.message);

  const errors = {};
  if (!email) errors.email = "This field is required";
  else if (!EMAIL_RE.test(email)) errors.email = "This field must contain a valid email";
  if (!message) errors.message = "This field is required";
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    console.error("contact: SMTP environment variables are missing");
    return res.status(500).json({ ok: false, error: "The contact form is not configured yet." });
  }

  const name = [first, last].filter(Boolean).join(" ");
  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const rows = [
    ["Name", name || "—"],
    ["Email", email],
    ["Subject", subject || "—"],
  ];
  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nMessage:\n${message}\n\n—\nSent from the contact form on ezzarghani.org`;
  const html =
    `<table style="font:14px/1.5 Arial,sans-serif;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td><strong>${esc(v)}</strong></td></tr>`).join("") +
    `</table><p style="font:14px/1.6 Arial,sans-serif;white-space:pre-wrap;border-left:3px solid #ddd;padding-left:12px">${esc(message)}</p>` +
    `<p style="font:12px Arial,sans-serif;color:#999">Sent from the contact form on ezzarghani.org — reply to this email to answer ${esc(name || email)}.</p>`;

  try {
    await transporter.sendMail({
      from: { name: "ezzarghani.org contact form", address: SMTP_USER },
      to: MAIL_TO,
      replyTo: name ? { name, address: email } : email,
      subject: `[Website] ${subject || `New message from ${name || email}`}`,
      text,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact: sendMail failed:", err && (err.code || err.message));
    return res.status(502).json({ ok: false, error: "The message could not be sent." });
  }
}
