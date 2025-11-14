// 이 파일은 특정 상품의 상세 정보를 제공하는 API 엔드포인트입니다.
// 클라이언트(브라우저)에서 상품 ID를 이용해 상품의 제목, 썸네일 이미지 URL 등을 요청할 수 있습니다.

import { NextResponse } from 'next/server'; // Next.js 서버 응답을 위한 유틸리티
import { prisma } from '@/lib/prisma'; // Prisma 클라이언트 (데이터베이스 접근 도구)
import { getS3Url } from '@/lib/s3'; // S3 이미지 URL을 생성하는 헬퍼 함수

/**
 * GET 요청을 처리하여 특정 상품의 상세 정보를 반환합니다.
 * @param {Request} request - Next.js 요청 객체 (여기서는 사용하지 않음)
 * @param {object} context - 요청 컨텍스트 (URL 파라미터 포함)
 * @param {object} context.params - URL 파라미터 객체
 * @param {string} context.params.id - 조회할 상품의 고유 ID
 * @returns {NextResponse} 상품 정보 또는 에러 메시지를 담은 JSON 응답
 */
export async function GET(request, context) {
  try {
    // URL 파라미터에서 상품 ID를 추출합니다.
    const { id } = await context.params;

    // Prisma를 사용하여 데이터베이스에서 상품 정보를 조회합니다.
    // 상품의 제목과 연결된 이미지 정보(s3Key)를 함께 가져옵니다.
    const listing = await prisma.listing.findUnique({
      where: { id }, // 요청된 ID와 일치하는 상품을 찾습니다.
      select: { // 필요한 필드만 선택하여 가져옵니다.
        id: true,
        title: true,
        listingImages: { // 상품 이미지 정보
          select: {
            s3Key: true, // S3에 저장된 이미지의 키
            isCover: true, // 이 이미지가 대표 이미지인지 여부
          },
        },
      },
    });

    // 상품을 찾지 못했거나, 상품이 삭제된 경우 에러 응답을 반환합니다.
    if (!listing || listing.deleted) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 } // 404 Not Found 상태 코드
      );
    }

    // 상품의 썸네일 이미지 URL을 결정합니다.
    // 1. isCover가 true인 이미지를 찾습니다.
    // 2. 없으면 첫 번째 이미지를 사용합니다.
    // 3. 이미지 자체가 없으면 null로 설정합니다.
    const coverImage = listing.listingImages.find(img => img.isCover) || listing.listingImages[0];
    const thumbnailUrl = coverImage ? getS3Url(coverImage.s3Key) : null;

    // 클라이언트에 반환할 상품 정보를 구성합니다.
    const listingDetails = {
      id: listing.id,
      title: listing.title,
      thumbnailUrl: thumbnailUrl,
    };

    // 성공적으로 상품 정보를 반환합니다.
    return NextResponse.json(listingDetails, { status: 200 }); // 200 OK 상태 코드
  } catch (error) {
    // 에러 발생 시 콘솔에 로그를 남기고, 500 Internal Server Error 응답을 반환합니다.
    console.error('상품 정보를 가져오는 중 에러 발생:', error);
    return NextResponse.json(
      { error: '상품 정보를 가져오는 데 실패했습니다.' },
      { status: 500 } // 500 Internal Server Error 상태 코드
    );
  }
}