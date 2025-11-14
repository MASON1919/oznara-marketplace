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
    region: process.env.AWS_REGION, // 서버 전용
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // 서버 전용
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // 서버 전용
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
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME, // 클라이언트에서도 사용 가능하도록 변경
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url, key };
}

/**
 * S3에 파일 직접 업로드
 * @param {Buffer} buffer - 업로드할 파일의 버퍼
 * @param {string} fileType - 파일의 MIME 타입
 * @returns {Promise<string>} S3 키 (파일 경로)
 */
export async function uploadToS3(buffer, fileType) {
  const key = `products/${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME, // 클라이언트에서도 사용 가능하도록 변경
    Key: key,
    Body: buffer,
    ContentType: fileType,
  });

  await s3Client.send(command);
  return key;
}

// S3에서 파일 삭제
export async function deleteFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME, // 클라이언트에서도 사용 가능하도록 변경
    Key: key,
  });

  await s3Client.send(command);
}

// 퍼블릭 접근으로 읽기 용도
export function getS3Url(key) {
  if (!key) return ""; // key가 없을 경우 빈 문자열 반환
  return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
}