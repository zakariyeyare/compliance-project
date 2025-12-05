/* eslint-env node */
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const env = globalThis?.process?.env ?? {};

const app = express();
const PORT = env.EMAIL_SERVER_PORT || 4100;
const allowedOrigins = env.EMAIL_ALLOWED_ORIGINS
  ? env.EMAIL_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(
  cors(
    allowedOrigins?.length
      ? {
          origin: allowedOrigins,
        }
      : undefined
  )
);
app.use(express.json({ limit: '25mb' }));

const hasSmtpConfig = env.EMAIL_HOST && env.EMAIL_PORT && env.EMAIL_USER && env.EMAIL_PASS;
const isMockTransport = !hasSmtpConfig;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT),
      secure: Number(env.EMAIL_PORT) === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/send-receipt', async (req, res) => {
  try {
    const { to, subject, filename, pdfBase64, metadata } = req.body;

    if (!to || !subject || !filename || !pdfBase64) {
      return res.status(400).json({
        error: 'Missing required fields (to, subject, filename, pdfBase64)',
      });
    }

    const attachment = {
      filename,
      content: pdfBase64,
      encoding: 'base64',
    };

    const htmlLines = [
      `<p>Hej ${metadata?.userName || 'der'}!</p>`,
      `<p>Din compliance rapport <strong>${metadata?.reportTitle || 'GDPR rapport'}</strong> er vedhæftet som PDF.</p>`,
      `<p>Standard: ${metadata?.standard || 'GDPR'}</p>`,
      '<p>Venlig hilsen<br/>Compliance App</p>',
    ];

    const mailOptions = {
      from: env.EMAIL_FROM || env.EMAIL_USER || 'noreply@example.com',
      to,
      subject,
      html: htmlLines.join('\n'),
      attachments: [attachment],
    };

    const info = await transporter.sendMail(mailOptions);
    if (isMockTransport) {
      console.log('--- Mock email payload ---');
      console.log(JSON.stringify({ to, subject, metadata, attachmentName: attachment.filename }, null, 2));
      console.log('---------------------------');
    } else {
      console.log(`Email delivered to ${to}. Message ID: ${info.messageId}`);
    }

    return res.json({ success: true, mockDelivery: isMockTransport, info });
  } catch (error) {
    console.error('Failed to send email', error);
    res.status(500).json({ error: 'Email server error', details: `${error}` });
  }
});

app.listen(PORT, () => {
  console.log(`Email server listening on http://localhost:${PORT}`);
  if (isMockTransport) {
    console.log(
      'No SMTP credentials found. Emails will be logged to console (json transport). Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS to send real mail.'
    );
  }
});
