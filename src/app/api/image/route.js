// 이 코드는 Next.js 서버에서 실행되는 부분입니다.

// 웹 응답을 만들 때 사용하는 `NextResponse`라는 도우미를 가져옵니다.
import { NextResponse } from "next/server";

/**
 * 이 기능은 S3에 저장된 이미지를 대신 가져다주는 "이미지 대리인(프록시)" 역할을 합니다.
 * 웹 페이지가 S3 이미지 주소에 직접 접근하는 대신, 이 대리인을 통해 이미지를 요청하게 함으로써
 * 보안을 더 튼튼하게 하고, 이미지 캐시(저장) 전략을 더 효율적으로 관리할 수 있습니다.
 * 
 * @param {Request} request - 웹 페이지에서 서버로 보낸 요청 정보. 
 *                            예: `/api/image?url=https://...s3.amazonaws.com/image.png`
 */
export async function GET(request) {
  try {
    // 1. 요청 주소에서 이미지의 실제 주소(`url`)를 찾아냅니다.
    // `request.url`은 웹 페이지가 요청한 전체 주소이고, 여기서 `?url=...` 부분을 분석합니다.
    const { searchParams } = new URL(request.url);
    // `url`이라는 이름으로 전달된 값을 가져옵니다.
    const url = searchParams.get("url");

    // 만약 이미지 주소(`url`)가 요청에 없다면, "URL이 필요합니다"라는 에러를 보냅니다.
    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 }); // 400은 "잘못된 요청" 에러 코드입니다.
    }

    // 2. 보안 검사: 이 대리인이 아무 웹사이트의 이미지나 가져오지 못하게 막습니다.
    // 이 기능이 악용되어 다른 웹사이트에 피해를 주지 않도록, 
    // 요청된 이미지 주소가 반드시 's3.amazonaws.com'을 포함하는 S3 주소인지 확인합니다.
    if (!url.includes("s3.amazonaws.com")) {
      return NextResponse.json(
        { error: "허용되지 않은 도메인입니다." },
        { status: 403 } // 403은 "접근 금지" 에러 코드입니다.
      );
    }

    // 3. 서버가 웹 페이지를 대신해서 S3에 있는 이미지를 가져옵니다.
    const response = await fetch(url);

    // 만약 S3에서 이미지를 가져오는 데 실패했다면 (예: 이미지가 없거나 접근 권한이 없으면),
    // "이미지를 불러올 수 없습니다"라는 에러를 보냅니다.
    if (!response.ok) {
      return NextResponse.json(
        { error: "이미지를 불러올 수 없습니다." },
        { status: response.status } // S3에서 받은 에러 코드를 그대로 전달합니다.
      );
    }

    // 4. 가져온 이미지 데이터를 컴퓨터가 이해할 수 있는 "덩어리(버퍼)" 형태로 바꿉니다.
    const buffer = await response.arrayBuffer();

    // 5. 이미지 데이터를 웹 페이지로 돌려줍니다.
    return new NextResponse(buffer, {
      headers: {
        // `Content-Type` 헤더: 웹 브라우저에게 이 응답이 이미지 파일임을 알려줍니다.
        // S3에서 받은 이미지 종류를 그대로 사용하고, 만약 없다면 기본값으로 'image/jpeg'를 사용합니다.
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        
        // `Cache-Control` 헤더: 웹 브라우저가 이 이미지를 얼마나 오래 저장해둘지 알려줍니다.
        // `public`: 이 이미지는 누구나 캐시(저장)할 수 있습니다.
        // `max-age=31536000`: 이 이미지를 1년(초 단위) 동안 브라우저에 저장해두세요.
        // 이렇게 하면 사용자가 같은 이미지를 다시 볼 때, 서버에 다시 요청하지 않고
        // 브라우저에 저장된 이미지를 바로 보여주므로 웹 페이지가 훨씬 빠르게 로드됩니다.
        "Cache-Control": "public, max-age=31536000",

        // `Access-Control-Allow-Origin` 헤더: 다른 웹사이트에서도 이 이미지를 가져갈 수 있도록 허용합니다.
        // 현재는 모든 웹사이트(`*`)에서 가져갈 수 있도록 설정되어 있습니다.
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    // 6. 혹시라도 중간에 문제가 생기면, 에러 내용을 기록하고 "이미지 로드 실패"라는 에러를 보냅니다.
    console.error("이미지 대리인 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "이미지 로드 실패" }, { status: 500 }); // 500은 "서버 내부 오류" 에러 코드입니다.
  }
}
