import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { env } from '../config/env.js';

const assertS3 = () => {
  if (!s3Client) {
    throw new Error('AWS S3 is not configured. Set AWS and S3 environment variables.');
  }
};

export const uploadBeatBuffer = async ({ key, buffer, contentType }) => {
  assertS3();

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_BEATS,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });

  await s3Client.send(command);
  return key;
};

export const uploadContractBuffer = async ({ key, buffer, contentType }) => {
  assertS3();

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_CONTRACTS,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });

  await s3Client.send(command);
  return key;
};

export const getBeatSignedReadUrl = async (key, expiresInSeconds = 3600) => {
  if (!key) return '';
  if (!s3Client) return '';

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_BEATS,
    Key: key
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

export const getContractSignedReadUrl = async (key, expiresInSeconds = 3600) => {
  if (!key) return '';
  if (!s3Client) return '';

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_CONTRACTS,
    Key: key
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};
