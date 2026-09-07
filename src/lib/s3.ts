import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.S3_ENDPOINT || undefined;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { region, bucket, accessKeyId, secretAccessKey, endpoint };
}

export function isS3Configured() {
  return getS3Config() !== null;
}

function getClient(config: NonNullable<ReturnType<typeof getS3Config>>) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: !!config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function createUploadUrl(key: string, contentType: string) {
  const config = getS3Config();
  if (!config) {
    throw new Error(
      "S3が設定されていません。管理者に環境変数(S3_REGION等)の設定を依頼してください。"
    );
  }

  const client = getClient(config);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = config.endpoint
    ? `${config.endpoint.replace(/\/$/, "")}/${config.bucket}/${key}`
    : `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl };
}
