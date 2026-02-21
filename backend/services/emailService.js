import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../config/ses.js';
import { env, hasSesConfigured } from '../config/env.js';
import EmailLog from '../models/EmailLog.js';

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const buildEmailShell = ({ eyebrow, title, intro, bodyHtml, ctaLabel, ctaUrl, note }) => `
  <div style="margin:0;padding:24px;background:#f2f2ef;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #94a3b8;">
      <tr>
        <td style="padding:24px 24px 12px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6d28d9;">${escapeHtml(eyebrow)}</p>
          <h1 style="margin:0;font-size:26px;line-height:1.25;color:#0f172a;">${escapeHtml(title)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 10px;font-size:15px;line-height:1.6;color:#334155;">
          <p style="margin:0;">${escapeHtml(intro)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 24px 16px;font-size:14px;line-height:1.7;color:#1f2937;">
          ${bodyHtml}
        </td>
      </tr>
      ${
        ctaUrl
          ? `<tr>
        <td style="padding:0 24px 20px;">
          <a href="${escapeHtml(
            ctaUrl
          )}" style="display:inline-block;padding:12px 20px;border-radius:999px;border:1px solid #9ca3af;background:#bef264;color:#0f172a;text-decoration:none;font-weight:600;">
            ${escapeHtml(ctaLabel || 'Open')}
          </a>
        </td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding:16px 24px 24px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
          <p style="margin:0;">${escapeHtml(note || 'JunahBlue')}</p>
        </td>
      </tr>
    </table>
  </div>
`;

const sendEmail = async ({ to, subject, text, html, metadata }) => {
  if (!hasSesConfigured || !sesClient) {
    await EmailLog.create({
      recipient: to,
      subject,
      status: 'failed',
      error: 'SES is not configured',
      metadata
    });

    return { success: false };
  }

  try {
    const source = `JunahBlue <${env.SES_FROM_EMAIL}>`;

    const command = new SendEmailCommand({
      Source: source,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: text },
          Html: { Data: html }
        }
      }
    });

    await sesClient.send(command);

    await EmailLog.create({
      recipient: to,
      subject,
      status: 'sent',
      metadata
    });

    return { success: true };
  } catch (error) {
    await EmailLog.create({
      recipient: to,
      subject,
      status: 'failed',
      error: error.message,
      metadata
    });

    return { success: false };
  }
};

export const sendBeatDeliveryEmail = async ({ to, beatTitle, downloadUrl, agreementUrl }) => {
  const safeBeatTitle = escapeHtml(beatTitle);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeAgreementUrl = escapeHtml(agreementUrl);
  const subject = `Your JunahBlue beat purchase: ${beatTitle}`;
  const text = [
    'Thanks for your purchase from JunahBlue.',
    '',
    `Beat: ${beatTitle}`,
    `WAVE download (expires): ${downloadUrl}`,
    `Signed agreement: ${agreementUrl}`,
    '',
    'If the download link expires, contact us and we can issue a new one.'
  ].join('\n');
  const html = buildEmailShell({
    eyebrow: 'Beat Purchase',
    title: 'Your Files Are Ready',
    intro: 'Thanks for your purchase. Your beat delivery and signed agreement are ready below.',
    bodyHtml: `
      <p style="margin:0 0 10px;">Beat: <strong>${safeBeatTitle}</strong></p>
      <p style="margin:0 0 10px;"><a href="${safeDownloadUrl}" style="color:#6d28d9;text-decoration:underline;">Download your WAVE file</a></p>
      <p style="margin:0;"><a href="${safeAgreementUrl}" style="color:#6d28d9;text-decoration:underline;">View your signed agreement</a></p>
    `,
    ctaLabel: 'Download WAVE',
    ctaUrl: downloadUrl,
    note: 'JunahBlue - Keep this email for your records.'
  });

  return sendEmail({
    to,
    subject,
    text,
    html,
    metadata: { kind: 'buyer-delivery', beatTitle }
  });
};

export const sendSellerAgreementCopyEmail = async ({ to, buyerEmail, beatTitle, agreementUrl }) => {
  const safeBuyerEmail = escapeHtml(buyerEmail);
  const safeBeatTitle = escapeHtml(beatTitle);
  const safeAgreementUrl = escapeHtml(agreementUrl);
  const subject = `Signed agreement copy: ${beatTitle}`;
  const text = [
    'A buyer completed a beat purchase on JunahBlue.',
    '',
    `Buyer: ${buyerEmail}`,
    `Beat: ${beatTitle}`,
    `Signed agreement: ${agreementUrl}`
  ].join('\n');
  const html = buildEmailShell({
    eyebrow: 'Seller Copy',
    title: 'New Signed Agreement',
    intro: 'A beat purchase has completed and the signed contract is archived.',
    bodyHtml: `
      <p style="margin:0 0 10px;">Buyer: <strong>${safeBuyerEmail}</strong></p>
      <p style="margin:0 0 10px;">Beat: <strong>${safeBeatTitle}</strong></p>
      <p style="margin:0;"><a href="${safeAgreementUrl}" style="color:#6d28d9;text-decoration:underline;">Open signed agreement</a></p>
    `,
    ctaLabel: 'Open Agreement',
    ctaUrl: agreementUrl,
    note: 'JunahBlue - Automated contract archive notification.'
  });

  return sendEmail({
    to,
    subject,
    text,
    html,
    metadata: { kind: 'seller-copy', beatTitle, buyerEmail }
  });
};
