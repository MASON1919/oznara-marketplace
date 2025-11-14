import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin"; // Admin SDK DB 인스턴스 임포트
import admin from "firebase-admin"; // admin 객체 임포트 (FieldValue 사용 위함)

/**
 * 사용자가 특정 채팅방을 나가거나 숨기는 요청을 처리하는 API 핸들러입니다.
 * 모든 참여자가 나가면 채팅방 문서를 삭제합니다.
 * 
 * @param {Request} request - 클라이언트로부터 받은 요청 객체
 */
export async function POST(request) {
  try {
    // 1. 현재 로그인한 사용자 세션을 가져옵니다.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. 요청 본문에서 채팅방 ID를 추출합니다.
    const { chatRoomId } = await request.json();
    if (!chatRoomId) {
      return NextResponse.json({ error: "채팅방 ID가 필요합니다." }, { status: 400 });
    }

    console.log(`[CHAT LEAVE DEBUG] User: ${userId} is leaving chatroom: ${chatRoomId}`);

    // 3. Firestore 문서 참조를 만들고, 현재 문서 데이터를 가져옵니다. (Admin SDK 사용)
    const chatRoomRef = adminDb.collection("chatrooms").doc(chatRoomId);
    const docSnap = await chatRoomRef.get(); // Admin SDK의 get() 메서드

    if (!docSnap.exists) { // Admin SDK의 exists 속성
      return NextResponse.json({ error: "채팅방을 찾을 수 없습니다." }, { status: 404 });
    }

    const chatRoomData = docSnap.data();
    const participants = chatRoomData.participants || [];
    const hiddenFor = chatRoomData.hiddenFor || [];

    console.log(`[CHAT LEAVE DEBUG] Participants:`, participants);
    console.log(`[CHAT LEAVE DEBUG] Current hiddenFor:`, hiddenFor);

    // 4. [통합 로직] 모든 참여자가 채팅방을 나갔는지 확인합니다.
    // 현재 사용자를 포함하여 숨김 처리된 사용자 집합을 만듭니다.
    const newHiddenFor = new Set([...hiddenFor, userId]);
    const participantsSet = new Set(participants);

    console.log(`[CHAT LEAVE DEBUG] Set of Participants:`, participantsSet);
    console.log(`[CHAT LEAVE DEBUG] Set of New hiddenFor (including current user):`, newHiddenFor);

    // 두 집합의 크기가 같고 모든 요소가 동일한지 확인합니다.
    const allHaveLeft = participantsSet.size === newHiddenFor.size &&
                        [...participantsSet].every(p => newHiddenFor.has(p));

    console.log(`[CHAT LEAVE DEBUG] Are all participants leaving? (allHaveLeft):`, allHaveLeft);

    if (allHaveLeft) {
      // 5-1. 모든 참여자가 나갔으므로 채팅방 문서를 삭제합니다. (Admin SDK 사용)
      console.log(`[CHAT LEAVE DEBUG] Deleting chatroom document with ID: ${chatRoomId}...`);
      await chatRoomRef.delete(); // Admin SDK의 delete() 메서드
      console.log(`[CHAT LEAVE DEBUG] Chatroom document ${chatRoomId} deleted successfully.`);
      return NextResponse.json({ message: "모든 사용자가 나가 채팅방이 삭제되었습니다." }, { status: 200 });
    } else {
      // 5-2. 아직 남은 참여자가 있으므로, 현재 사용자만 숨김 처리합니다. (Admin SDK 사용)
      console.log(`[CHAT LEAVE DEBUG] Hiding chatroom for user...`);
      await chatRoomRef.update({
        hiddenFor: admin.firestore.FieldValue.arrayUnion(userId), // Admin SDK의 FieldValue 사용
      });
      return NextResponse.json({ message: "채팅방을 목록에서 숨겼습니다." }, { status: 200 });
    }

  } catch (error) {
    console.error("채팅방 나가기/숨기기 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}