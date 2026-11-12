// backend/services/emailService.js
// Serviciu email cu nodemailer (SMTP configurabil via variabile de mediu).
// Suportă orice furnizor SMTP: Brevo, SendGrid, Gmail, Mailgun, etc.
//
// Variabile necesare în .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, FRONTEND_URL
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // email neconfigurat — apelantul decide fallback-ul
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587,
    secure: parseInt(SMTP_PORT, 10) === 465, // true pentru 465 (SSL), false pentru 587 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Timeout-uri scurte ca să nu atârne request-ul dacă SMTP e indisponibil
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
  return transporter;
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'Popas pentru Suflet <noreply@popas-pentru-suflet.vercel.app>';
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || 'https://popas-pentru-suflet.vercel.app').replace(/\/$/, '');
}

const layout = (content) => `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:32px;">🕊️</div>
      <div style="color:#d4af37;font-size:22px;font-weight:bold;">Popas pentru Suflet</div>
    </div>
    <div style="background:#1a1a2e;border:1px solid #d4af3726;border-radius:16px;padding:28px;color:#e8e8e8;line-height:1.7;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;color:#6b6b80;font-size:13px;">
      Popas pentru Suflet — un loc de odihnă pentru sufletul tău<br>
      <a href="${frontendUrl()}" style="color:#d4af37;">popas-pentru-suflet.vercel.app</a>
    </div>
  </div>
</body>
</html>`;

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    console.log(`📧 [email neconfigurat] Către: ${to} | Subiect: ${subject}`);
    return { sent: false, reason: 'not_configured' };
  }
  try {
    await tx.sendMail({ from: fromAddress(), to, subject, html: layout(html), text });
    console.log(`📧 Email trimis către ${to}: ${subject}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Eroare trimitere email către ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── Emailuri specifice ─────────────────────────────────────────────

async function sendPasswordResetEmail(email, rawToken) {
  const link = `${frontendUrl()}/reset-password?token=${rawToken}`;
  return sendMail({
    to: email,
    subject: 'Resetare parolă — Popas pentru Suflet',
    html: `
      <p>Bună,</p>
      <p>Am primit o cerere de resetare a parolei pentru contul tău Popas pentru Suflet.</p>
      <p>Apasă butonul de mai jos pentru a-ți seta o parolă nouă. Link-ul este valabil <strong>1 oră</strong>.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${link}" style="background:linear-gradient(135deg,#d4af37,#b8960c);color:#0a0a0f;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;">Resetează parola</a>
      </p>
      <p style="color:#a0a0b0;font-size:14px;">Dacă nu ai cerut tu resetarea, poți ignora acest email — contul tău rămâne în siguranță.</p>
    `,
    text: `Resetează-ți parola Popas pentru Suflet (valabil 1 oră): ${link}\n\nDacă nu ai cerut resetarea, ignoră acest email.`,
  });
}

async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: 'Bine ai venit la Popas pentru Suflet 🕊️',
    html: `
      <p>Bună, ${user.nume}!</p>
      <p>Bine ai venit în comunitatea Popas pentru Suflet. Suntem bucuroși că ești aici.</p>
      <p>Poți începe chiar acum:</p>
      <ul>
        <li>📖 Citește Biblia Cornilescu completă online</li>
        <li>🙏 Primește devoționalul zilnic</li>
        <li>📔 Ține-ți jurnalul spiritual</li>
        <li>🕊️ Urmărește-ți călătoria spirituală cu badge-uri</li>
      </ul>
      <p style="text-align:center;margin:24px 0;">
        <a href="${frontendUrl()}/dashboard" style="background:linear-gradient(135deg,#d4af37,#b8960c);color:#0a0a0f;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;">Deschide aplicația</a>
      </p>
      <p style="color:#a0a0b0;font-size:14px;">„Veniți la Mine, toți cei trudiți și împovărați, și Eu vă voi da odihnă." — Matei 11:28</p>
    `,
    text: `Bine ai venit la Popas pentru Suflet, ${user.nume}! Deschide aplicația: ${frontendUrl()}/dashboard`,
  });
}

module.exports = { sendMail, sendPasswordResetEmail, sendWelcomeEmail, isConfigured: () => !!getTransporter() };
