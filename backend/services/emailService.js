import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../config/ses.js';
import { env, hasSesConfigured } from '../config/env.js';
import EmailLog from '../models/EmailLog.js';

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
    const command = new SendEmailCommand({
      Source: env.SES_FROM_EMAIL,
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
  const subject = `Your Junah beat purchase: ${beatTitle}`;
  const text = `Thanks for your purchase.\n\nWAVE download: ${downloadUrl}\nSigned agreement: ${agreementUrl}`;
  const html = `<p>Thanks for your purchase.</p><p><a href="${downloadUrl}">Download your WAVE file</a></p><p><a href="${agreementUrl}">View signed agreement</a></p>`;

  return sendEmail({
    to,
    subject,
    text,
    html,
    metadata: { kind: 'buyer-delivery', beatTitle }
  });
};

export const sendSellerAgreementCopyEmail = async ({ to, buyerEmail, beatTitle, agreementUrl }) => {
  const subject = `Signed agreement copy: ${beatTitle}`;
  const text = `Buyer: ${buyerEmail}\nBeat: ${beatTitle}\nSigned agreement: ${agreementUrl}`;
  const html = `<p>Buyer: ${buyerEmail}</p><p>Beat: ${beatTitle}</p><p><a href="${agreementUrl}">Open signed agreement</a></p>`;

  return sendEmail({
    to,
    subject,
    text,
    html,
    metadata: { kind: 'seller-copy', beatTitle, buyerEmail }
  });
};
