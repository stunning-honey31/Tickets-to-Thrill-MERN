const nodemailer = require('nodemailer');

/**
 * Sends the ticket-confirmation email (HTML body + PDF attached).
 * If SMTP_HOST/SMTP_USER/SMTP_PASS aren't set in .env, there's no way
 * to actually deliver mail here, so this falls back to logging the
 * email to the console instead of failing the checkout - the same
 * "payment still succeeds even if the email can't go out" behavior
 * the original PHP app had when mail() had no MTA configured.
 */
async function sendTicketEmail({ to, name, orderId, total, pdfBuffer }) {
  const fromName = process.env.MAIL_FROM_NAME || 'Tickets to Thrill';
  const fromEmail = process.env.MAIL_FROM_EMAIL || 'no-reply@ticketstothrill.example';
  const subject = `Your Tickets to Thrill e-ticket - Order #${orderId}`;
  const html = `
    <div style="font-family:sans-serif">
      <h2>Thanks for booking, ${name}!</h2>
      <p>Your order <strong>#${orderId}</strong> is confirmed. Total paid: <strong>Rs. ${total.toFixed(2)}</strong>.</p>
      <p>Your e-ticket is attached as a PDF - present it (printed or on screen) at the gate.</p>
    </div>
  `;

  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!hasSmtp) {
    console.log('--------------------------------------------------');
    console.log('[mailer] No SMTP_* configured in .env - logging the email instead of sending it.');
    console.log(`[mailer] To: ${to}`);
    console.log(`[mailer] Subject: ${subject}`);
    console.log('[mailer] (PDF ticket attached, not shown here)');
    console.log('--------------------------------------------------');
    return { delivered: false, reason: 'no-smtp-configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      attachments: [{ filename: `ticket-order-${orderId}.pdf`, content: pdfBuffer }],
    });
    return { delivered: true };
  } catch (err) {
    console.error('[mailer] send failed:', err.message);
    return { delivered: false, reason: err.message };
  }
}

module.exports = { sendTicketEmail };
