import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
export const runtime = "nodejs";
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const { title, description, price, category, method, imageKeys, filesInfo } =
    await request.json();
  if (!session) {
    //session 정보가 없으면 에러임
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = session?.user?.id;
  try {
    const newListing = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.create({
        data: { title, description, price, category, method, userId },
      });

      await tx.listingImage.createMany({
        data: imageKeys.map((key, idx) => ({
          listingId: listing.id,
          s3Key: key,
          isCover: idx === 0,
          mime: filesInfo[idx]?.type || "",
          size: filesInfo[idx]?.size || 0,
        })),
        skipDuplicates: true, // unique 제약을 줄 경우 중복 스킵
      });

      return tx.listing.findUnique({
        where: { id: listing.id },
        include: { listingImages: true },
      });
    });
    return new Response(JSON.stringify(newListing), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
