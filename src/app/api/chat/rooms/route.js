import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import prisma from "@/lib/prisma";

/**
 * 내 채팅방 목록 조회 API
 * GET /api/chat/rooms
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Firestore에서 내가 참여한 채팅방 조회 (컬렉션 이름: chatrooms)
    const chatRoomsRef = collection(db, "chatrooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId)
    );

    const querySnapshot = await getDocs(q);
    const chatRooms = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // 상대방 ID 추출
      const otherUserId = data.participants?.find((id) => id !== userId);

      if (!otherUserId) return; // 상대방이 없으면 스킵

      chatRooms.push({
        id: doc.id,
        otherUserId,
        otherUserName: "채팅 상대", // 나중에 User 정보로 업데이트
        lastMessage: data.lastMessage || "메시지를 시작하세요",
        updatedAt:
          data.lastMessageTimestamp?.toDate?.() ||
          data.createdAt?.toDate?.() ||
          new Date(),
        listingId: data.listingId,
      });
    });

    // 클라이언트에서 정렬
    chatRooms.sort((a, b) => b.updatedAt - a.updatedAt);

    // 상대방 이름 조회 (DB에서)
    const userIds = [...new Set(chatRooms.map((room) => room.otherUserId))];

    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });

      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user.name || user.email;
      });

      // 채팅방에 상대방 이름 추가
      chatRooms.forEach((room) => {
        room.otherUserName = userMap[room.otherUserId] || "사용자";
      });
    }

    return NextResponse.json({
      chatRooms,
      count: chatRooms.length,
    });
  } catch (error) {
    console.error("채팅방 조회 오류:", error);
    return NextResponse.json(
      { error: "채팅방 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
