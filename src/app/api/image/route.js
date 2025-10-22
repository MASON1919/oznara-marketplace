import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    // S3 URL만 허용 (보안)
    if (!url.includes("s3.amazonaws.com")) {
      return NextResponse.json(
        { error: "허용되지 않은 도메인입니다." },
        { status: 403 }
      );
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "이미지를 불러올 수 없습니다." },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("이미지 프록시 에러:", error);
    return NextResponse.json({ error: "이미지 로드 실패" }, { status: 500 });
  }
}
