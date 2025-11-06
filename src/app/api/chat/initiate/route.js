// 이 코드는 Next.js 서버에서 실행되는 부분입니다.

// 웹 응답을 만들 때 사용하는 `NextResponse`라는 도우미를 가져옵니다.
import { NextResponse } from "next/server";

// 로그인한 사용자의 정보를 서버에서 가져올 때 사용하는 `getServerSession`이라는 도우미를 가져옵니다.
import { getServerSession } from "next-auth";

// 우리 앱의 로그인 설정 정보 (`authOptions`)를 가져옵니다.
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Firebase Firestore 데이터베이스에 접근하는 기능 (`db`)을 가져옵니다.
import { db } from "@/lib/firebase";

// Firestore에서 데이터를 다룰 때 사용하는 기능들을 가져옵니다.
// `doc`: 특정 데이터(문서)를 가리키는 기능
// `getDoc`: 특정 데이터를 가져오는 기능
// `setDoc`: 새로운 데이터를 만들거나 기존 데이터를 덮어쓰는 기능
// `serverTimestamp`: 서버의 현재 시간을 기록하는 기능
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// `prisma`는 우리 앱의 주요 데이터베이스(PostgreSQL)에 접근하는 도구입니다.
import prisma from "@/lib/prisma";

/**
 * 이 기능은 "채팅 시작하기" 요청을 처리하는 서버의 문(API)입니다.
 * 웹 페이지에서 '채팅하기' 버튼을 누르면 이 문으로 요청이 들어옵니다.
 *
 * @param {Request} request - 웹 페이지에서 서버로 보낸 요청 정보
 */
export async function POST(request) {
  // 1. 요청을 보낸 사람이 누구인지, 로그인했는지 확인합니다.
  const session = await getServerSession(authOptions);

  // 만약 로그인하지 않았다면, "로그인 필요"라는 메시지와 함께 에러를 보냅니다.
  if (!session) {
    return NextResponse.json(
      { error: "로그인되지 않았습니다." },
      { status: 401 }
    ); // 401은 "인증되지 않음" 에러 코드입니다.
  }

  const { sellerId, listingId } = await request.json();
  const buyerId = session.user.id;

  if (!sellerId) {
    return NextResponse.json(
      { error: "판매자 ID가 필요합니다." },
      { status: 400 }
    );
  }

  // 만약 내가 판매자라면 (자기 상품 페이지에서 채팅 버튼을 눌렀다면)
  // 이 상품의 구매자(예약자)를 찾아서 그 사람과 채팅방을 만듭니다.
  let otherUserId = sellerId; // 기본값: 판매자와 채팅

  if (sellerId === buyerId && listingId) {
    // 상품의 거래 정보에서 구매자를 찾습니다
    const transaction = await prisma.transaction.findFirst({
      where: {
        listingId: listingId,
        status: {
          in: ["Pending", "Completed"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        buyerId: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "아직 구매 요청이 없습니다." },
        { status: 400 }
      );
    }

    otherUserId = transaction.buyerId; // 구매자와 채팅
  }

  const chatRoomId = [buyerId, otherUserId].sort().join("-");

  try {
    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const chatRoomSnap = await getDoc(chatRoomRef);

    if (!chatRoomSnap.exists()) {
      await setDoc(chatRoomRef, {
        participants: [buyerId, otherUserId],
        createdAt: serverTimestamp(),
        lastMessageTimestamp: serverTimestamp(),
        lastRead: {
          [buyerId]: serverTimestamp(),
          [otherUserId]: serverTimestamp(),
        },
      });
    }

    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        // 필요한 정보만 딱 골라서 가져옵니다.
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    // 만약 판매자 정보를 찾을 수 없다면, "판매자를 찾을 수 없습니다"라는 에러를 보냅니다.
    if (!otherUser) {
      return NextResponse.json(
        { error: "판매자를 찾을 수 없습니다." },
        { status: 404 }
      ); // 404는 "찾을 수 없음" 에러 코드입니다.
    }

    // 8. 모든 과정이 성공적으로 끝나면,
    //    만들어진 채팅방 ID와 상대방 정보를 웹 페이지로 돌려줍니다.
    return NextResponse.json({ chatRoomId, otherUser }, { status: 200 }); // 200은 "성공" 에러 코드입니다.
  } catch (error) {
    // 9. 혹시라도 중간에 문제가 생기면, 에러 내용을 기록하고 "채팅방 시작 실패"라는 에러를 보냅니다.
    console.error("채팅방 시작 중 오류 발생:", error);
    return NextResponse.json(
      { error: "채팅방 시작에 실패했습니다.", details: error.message },
      { status: 500 } // 500은 "서버 내부 오류" 에러 코드입니다.
    );
  }
}
