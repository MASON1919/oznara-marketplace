import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const globalForS3 = globalThis;
export const s3Client =
  globalForS3.s3Client ??
  new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

// 개발 환경에서는 globalThis에 캐시해두기, prisma 클라이언트처럼 싱글턴 패턴을 쓰자!
if (process.env.NODE_ENV !== "production") {
  globalForS3.s3Client = s3Client;
}

// presigned URL 생성
export async function getPresignedUrl(fileName, fileType) {
  const key = `products/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url, key };
}

// S3에서 파일 삭제
export async function deleteFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

// 퍼블릭 접근으로 읽기 용도
export function getS3Url(key) {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
