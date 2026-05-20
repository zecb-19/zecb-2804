import "server-only";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { log } from "@/lib/log";

const REGION = process.env.AWS_S3_REGION || "eu-north-1";
const BUCKET = process.env.AWS_S3_BUCKET || "zecb-storage";

let client: S3Client | null = null;

function getClient(): S3Client | null {
  if (client) return client;

  const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    log.info("[storage] AWS S3 credentials not set — file storage disabled");
    return null;
  }

  client = new S3Client({
    region: REGION,
    credentials: { accessKeyId, secretAccessKey },
  });

  log.info({ region: REGION, bucket: BUCKET }, "[storage] AWS S3 client initialized");
  return client;
}

export async function uploadFile(
  key: string,
  body: Buffer | string,
  contentType = "application/octet-stream",
): Promise<string | null> {
  const s3 = getClient();
  if (!s3) return null;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: typeof body === "string" ? Buffer.from(body, "utf-8") : body,
      ContentType: contentType,
    }));
    const url = `s3://${BUCKET}/${key}`;
    log.info({ key, bucket: BUCKET }, "File uploaded to S3");
    return url;
  } catch (err) {
    log.error({ key, error: (err as Error).message }, "S3 upload failed");
    return null;
  }
}

export async function downloadFile(key: string): Promise<Buffer | null> {
  const s3 = getClient();
  if (!s3) return null;

  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const bytes = await res.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes) : null;
  } catch (err) {
    log.error({ key, error: (err as Error).message }, "S3 download failed");
    return null;
  }
}

export function buildStorageKey(productSlug: string, ...parts: string[]): string {
  return `products/${productSlug}/${parts.join("/")}`;
}

export function isStorageConfigured(): boolean {
  return !!(process.env.AWS_S3_ACCESS_KEY_ID && process.env.AWS_S3_SECRET_ACCESS_KEY);
}
