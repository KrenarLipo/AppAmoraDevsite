import nodemailer from "nodemailer";

// Email through any mailbox's SMTP server (GoDaddy cPanel, Zoho, Google Workspace, Brevo…).
// Env: SMTP_HOST, SMTP_PORT (465 = SSL, 587 = STARTTLS), SMTP_USER, SMTP_PASS,
// EMAIL_FROM (e.g. "AppAmora <hello@appamora.com>") and ADMIN_NOTIFY_EMAIL (where admin alerts go).
// Without SMTP settings nothing is sent; activity still shows in the admin.

export const emailEnabled = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transport: nodemailer.Transporter | null = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type Email = {
  to: string | string[];
  subject: string;
  /** Plain paragraphs; also used for the HTML version. */
  lines: string[];
  /** Optional button. */
  action?: { label: string; url: string };
};

/** A simple branded email. Returns false (and logs) when sending isn't set up or fails. */
export async function sendEmail(email: Email): Promise<boolean> {
  const to = [email.to].flat().filter(Boolean);
  if (to.length === 0) return false;
  if (!emailEnabled()) {
    console.info(`[email skipped: SMTP not set up] ${email.subject} → ${to.join(", ")}`);
    return false;
  }
  const text = [...email.lines, ...(email.action ? ["", `${email.action.label}: ${email.action.url}`] : [])].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#F6F5F1;font-family:Inter,Arial,sans-serif;color:#0E1116">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-weight:700;font-size:20px;margin:0 0 24px">app<span style="color:#D7381F">amora</span></p>
<div style="background:#fff;border:1px solid #E2E0D8;border-radius:14px;padding:24px">
${email.lines.map((line) => (line ? `<p style="margin:0 0 12px;line-height:1.6">${escapeHtml(line)}</p>` : "")).join("\n")}
${email.action ? `<p style="margin:20px 0 0"><a href="${escapeHtml(email.action.url)}" style="display:inline-block;background:#D7381F;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${escapeHtml(email.action.label)}</a></p>` : ""}
</div>
<p style="color:#4A5160;font-size:12px;margin:16px 0 0">AppAmora · appamora.com</p>
</div></body></html>`;
  try {
    await getTransport().sendMail({
      from: process.env.EMAIL_FROM ?? `AppAmora <${process.env.SMTP_USER}>`,
      to,
      subject: email.subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Could not send "${email.subject}"`, error);
    return false;
  }
}
