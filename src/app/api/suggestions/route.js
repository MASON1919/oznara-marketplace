// /src/app/api/suggestions/route.js

// Next.js 서버에서 응답을 생성하기 위한 NextResponse를 가져옵니다.
import { NextResponse } from 'next/server';
// Prisma 클라이언트를 가져옵니다. 데이터베이스와 상호작용하는 데 사용됩니다.
import prisma from '@/lib/prisma';

// GET 요청을 처리하는 비동기 함수입니다.
// 이 함수는 사용자가 검색창에 입력할 때 자동 완성 제안을 제공합니다.
export async function GET(request) {
  // 요청 URL에서 검색 파라미터를 추출합니다.
  const { searchParams } = new URL(request.url);
  // 'q'라는 이름의 파라미터 값을 가져옵니다. 이것이 사용자의 입력입니다.
  const query = searchParams.get('q');

  // 사용자의 입력이 없거나 너무 짧으면 (2자 미만) 빈 배열을 반환합니다.
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Prisma를 사용하여 데이터베이스에서 제안을 검색합니다.
    const suggestions = await prisma.product.findMany({
      where: {
        // 상품의 'title'(제목)이 사용자의 입력('query')으로 시작하는 경우를 찾습니다.
        title: {
          startsWith: query,
          // 'insensitive' 모드는 대소문자를 구분하지 않고 검색하도록 합니다.
          mode: 'insensitive',
        },
      },
      // 결과에서 'title' 필드만 선택하여 가져옵니다.
      select: {
        title: true,
      },
      // 'title' 필드를 기준으로 중복된 결과를 제거합니다.
      distinct: ['title'],
      // 최대 5개의 제안만 가져옵니다.
      take: 5,
    });

    // 가져온 제안 객체 배열을 제목 문자열 배열로 변환합니다.
    // 예: [{ title: '사과' }, { title: '사이다' }] -> ['사과', '사이다']
    const suggestionTitles = suggestions.map(product => product.title);

    // 변환된 제목 배열을 JSON 형태로 클라이언트에 반환합니다.
    return NextResponse.json(suggestionTitles);
  } catch (error) {
    // 에러가 발생하면 콘솔에 에러를 기록하고, 500 상태 코드와 함께 에러 메시지를 반환합니다.
    console.error("Suggestions API Error:", error);
    return NextResponse.json(
      { error: "제안을 가져오는 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}