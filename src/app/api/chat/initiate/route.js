
// Next.js 서버 응답을 위한 유틸리티와 NextAuth 세션 관리를 위한 함수들을 import 합니다.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Firebase Firestore 인스턴스와 Firestore 관련 함수들을 import 합니다.
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// POST 요청을 처리하는 함수입니다. 클라이언트에서 채팅 시작 요청을 받습니다。
export async function POST(request) {
  // NextAuth를 사용하여 현재 로그인된 사용자의 세션 정보를 가져옵니다.
  const session = await getServerSession(authOptions);

  // 세션 정보가 없으면 (로그인되지 않은 사용자) 401 Unauthorized 응답을 반환합니다.
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 요청 본문에서 판매자 ID를 가져옵니다.
  const { sellerId } = await request.json();
  // 로그인된 사용자의 ID를 구매자 ID로 설정합니다.
  const buyerId = session.user.id;

  // 판매자 ID가 제공되지 않았으면 400 Bad Request 응답을 반환합니다.
  if (!sellerId) {
    return NextResponse.json(
      { error: "Seller ID is required" },
      { status: 400 }
    );
  }

  // 판매자 ID와 구매자 ID가 같으면 (자신과 채팅 시도) 400 Bad Request 응답을 반환합니다.
  if (sellerId === buyerId) {
    return NextResponse.json(
      { error: "Cannot start chat with yourself" },
      { status: 400 }
    );
  }

  // 구매자 ID와 판매자 ID를 정렬하여 고유한 채팅방 ID를 생성합니다.
  // 이렇게 하면 두 사용자 간의 채팅방은 항상 동일한 ID를 가지게 됩니다.
  const chatRoomId = [buyerId, sellerId].sort().join("-");

  try {
    // Firestore에서 해당 chatRoomId를 가진 문서(채팅방)의 참조를 가져옵니다.
    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    // 해당 채팅방 문서의 스냅샷을 가져옵니다.
    const chatRoomSnap = await getDoc(chatRoomRef);

    // 채팅방이 존재하지 않으면 새로 생성합니다.
    if (!chatRoomSnap.exists()) {
      await setDoc(chatRoomRef, {
        participants: [buyerId, sellerId],
        createdAt: serverTimestamp(),
        lastMessageTimestamp: serverTimestamp(), // 새로운 채팅방 생성 시 마지막 메시지 시간 초기화
        lastRead: { // 각 참여자의 마지막 읽은 시간 초기화
          [buyerId]: serverTimestamp(),
          [sellerId]: serverTimestamp(),
        },
      });
    }

    // 성공적으로 채팅방 ID를 반환합니다.
    return NextResponse.json({ chatRoomId }, { status: 200 });
  } catch (error) {
    // 에러 발생 시 콘솔에 에러를 기록하고 500 Internal Server Error 응답을 반환합니다.
    console.error("Error initiating chat room:", error);
    return NextResponse.json(
      { error: "Failed to initiate chat room", details: error.message },
      { status: 500 }
    );
  }
}
