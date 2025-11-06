
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import prisma from "@/lib/prisma"; // ADD THIS IMPORT

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { sellerId } = await request.json();
  const buyerId = session.user.id;

  if (!sellerId) {
    return NextResponse.json(
      { error: "Seller ID is required" },
      { status: 400 }
    );
  }

  if (sellerId === buyerId) {
    return NextResponse.json(
      { error: "Cannot start chat with yourself" },
      { status: 400 }
    );
  }

  const chatRoomId = [buyerId, sellerId].sort().join("-");

  try {
    const chatRoomRef = doc(db, "chatrooms", chatRoomId);
    const chatRoomSnap = await getDoc(chatRoomRef);

    if (!chatRoomSnap.exists()) {
      await setDoc(chatRoomRef, {
        participants: [buyerId, sellerId],
        createdAt: serverTimestamp(),
        lastMessageTimestamp: serverTimestamp(),
        lastRead: {
          [buyerId]: serverTimestamp(),
          [sellerId]: serverTimestamp(),
        },
      });
    }

    // FETCH OTHER USER DATA (sellerId's data)
    const otherUser = await prisma.user.findUnique({
      where: {
        id: sellerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // RETURN chatRoomId AND otherUser
    return NextResponse.json({ chatRoomId, otherUser }, { status: 200 });
  } catch (error) {
    console.error("Error initiating chat room:", error);
    return NextResponse.json(
      { error: "Failed to initiate chat room", details: error.message },
      { status: 500 }
    );
  }
}
