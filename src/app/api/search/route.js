// /src/app/api/search/route.js

// Next.js 서버에서 응답을 생성하기 위한 NextResponse를 가져옵니다.
import { NextResponse } from 'next/server';
// Prisma 클라이언트를 가져옵니다. 데이터베이스와 상호작용하는 데 사용됩니다.
import prisma from '@/lib/prisma';
// Prisma 스키마에 정의된 ProductStatus 열거형을 가져옵니다. (예: 'SALE', 'SOLD_OUT')
import { ProductStatus } from '@prisma/client';

// GET 요청을 처리하는 비동기 함수입니다.
// 이 함수는 클라이언트로부터 검색 요청을 받아 데이터베이스에서 상품을 검색하고 결과를 반환합니다.
export async function GET(request) {
    // 요청 URL에서 검색 파라미터를 추출합니다.
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || ''; // 검색어 (기본값: 빈 문자열)
    const category = searchParams.get('category'); // 카테고리
    const status = searchParams.get('status'); // 상품 상태
    const minPrice = searchParams.get('minPrice'); // 최소 가격
    const maxPrice = searchParams.get('maxPrice'); // 최대 가격
    const cursor = searchParams.get('cursor'); // 페이지네이션을 위한 커서
    const sort = searchParams.get('sort') || 'createdAt_desc'; // 정렬 기준 (기본값: 최신순)
    const itemsPerPage = 10; // 한 페이지에 표시할 항목 수

    // API가 받은 파라미터들을 콘솔에 기록합니다. (디버깅용)
    console.log(`[API] Received: q="${searchTerm}", category="${category}", status="${status}", minPrice="${minPrice}", maxPrice="${maxPrice}", sort="${sort}"`);

    try {
        // Prisma 쿼리에 사용할 'where' 객체를 초기화합니다.
        let where = {};

        // 검색어가 있는 경우, 제목 또는 내용에 검색어가 포함된 상품을 찾도록 조건을 추가합니다.
        if (searchTerm) {
            where.OR = [
                { title: { contains: searchTerm, mode: 'insensitive' } }, // 대소문자 구분 안 함
                { content: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }

        // 카테고리가 있는 경우, 해당 카테고리(주소 이름)에 속한 상품을 찾도록 조건을 추가합니다.
        if (category) {
            where.address = {
                name: category,
            };
        }

        // 상품 상태 필터가 있는 경우, 해당 상태의 상품을 찾도록 조건을 추가합니다.
        if (status) {
            // ProductStatus 열거형에 포함된 유효한 값인지 확인합니다.
            if (Object.values(ProductStatus).includes(status)) {
                where.status = status;
            } else {
                // 유효하지 않은 값이면 경고를 기록합니다.
                console.warn(`[API] Invalid status value received: ${status}`);
            }
        }

        // 가격 필터가 있는 경우, 해당 가격 범위 내의 상품을 찾도록 조건을 추가합니다.
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) {
                const parsedMinPrice = parseInt(minPrice, 10); // 문자열을 정수로 변환
                if (!isNaN(parsedMinPrice)) {
                    where.price.gte = parsedMinPrice; // gte: 크거나 같음
                }
            }
            if (maxPrice) {
                const parsedMaxPrice = parseInt(maxPrice, 10);
                if (!isNaN(parsedMaxPrice)) {
                    where.price.lte = parsedMaxPrice; // lte: 작거나 같음
                }
            }
        }

        // 최종적으로 생성된 Prisma 'where' 절을 콘솔에 기록합니다. (디버깅용)
        console.log(`[API] Final Prisma 'where' clause:`, where);

        // 정렬 조건을 설정합니다.
        let orderBy;
        switch (sort) {
            case 'createdAt_asc': // 오래된순
                orderBy = [{ createdAt: 'asc' }, { id: 'asc' }]; // 생성 시간 오름차순, 같으면 ID 오름차순
                break;
            case 'price_asc': // 가격 낮은순
                orderBy = [{ price: 'asc' }, { id: 'asc' }]; // 가격 오름차순, 같으면 ID 오름차순
                break;
            case 'price_desc': // 가격 높은순
                orderBy = [{ price: 'desc' }, { id: 'asc' }]; // 가격 내림차순, 같으면 ID 오름차순
                break;
            default: // 기본값: 최신순
                orderBy = [{ createdAt: 'desc' }, { id: 'asc' }]; // 생성 시간 내림차순, 같으면 ID 오름차순
                break;
        }

        // Prisma를 사용하여 데이터베이스에서 상품을 조회합니다.
        const results = await prisma.product.findMany({
            where, // 위에서 만든 필터링 조건
            take: itemsPerPage, // 가져올 항목 수
            ...(cursor && { // 커서가 있는 경우 (페이지네이션)
                skip: 1, // 커서 자체는 건너뛰기
                cursor: {
                    id: cursor, // 커서의 ID를 기준으로 다음 페이지를 가져옴
                },
            }),
            orderBy, // 정렬 조건
            include: { // 연관된 데이터를 함께 가져옴
                address: { // 상품의 주소 정보
                    select: {
                        name: true, // 주소 이름만 선택
                    },
                },
            },
        });

        // 다음 페이지를 위한 커서를 설정합니다.
        let nextCursor = null;
        // 조회된 결과의 수가 페이지당 항목 수와 같으면, 다음 페이지가 있을 가능성이 있습니다.
        if (results.length === itemsPerPage) {
            // 마지막 항목의 ID를 다음 커서로 사용합니다.
            nextCursor = results[itemsPerPage - 1].id;
        }

        // 조회된 결과와 다음 커서를 JSON 형태로 클라이언트에 반환합니다.
        return NextResponse.json({
            results,
            nextCursor,
        });

    } catch (error) {
        // 에러가 발생하면 콘솔에 에러를 기록하고, 500 상태 코드와 함께 에러 메시지를 반환합니다.
        console.error("Prisma Search API Error:", error);
        return NextResponse.json(
            { error: "검색 중 오류가 발생했습니다.", details: error.message },
            { status: 500 }
        );
    }
}