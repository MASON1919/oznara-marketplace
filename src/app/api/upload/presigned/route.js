import { NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/s3";

export async function POST(request) {
  try {
    const { fileName, fileType } = await request.json();

    // 파일 타입 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다." },
        { status: 400 }
      );
    }

    const { url, key } = await getPresignedUrl(fileName, fileType);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Presigned URL 생성 실패:", error);
    return NextResponse.json(
      { error: "업로드 URL 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
