import { Client } from 'minio';
import { config } from './config.js';

const endpoint = new URL(config.MINIO_ENDPOINT);
export const minio = new Client({
  endPoint: endpoint.hostname,
  port: Number(endpoint.port || (endpoint.protocol === 'https:' ? 443 : 80)),
  useSSL: endpoint.protocol === 'https:',
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY,
});

export async function ensureBucket() {
  const exists = await minio.bucketExists(config.MINIO_BUCKET);
  if (!exists) await minio.makeBucket(config.MINIO_BUCKET);
}

export async function createPresignedUpload(objectKey: string, expiresSeconds = 900) {
  await ensureBucket();
  return minio.presignedPutObject(config.MINIO_BUCKET, objectKey, expiresSeconds);
}
