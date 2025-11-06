import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getS3Url } from "@/lib/s3";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const userId = session.user.id;

    const likes = await prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            listing: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    deleted: true,
                    listingImages: {
                        where: { isCover: true },
                        select: { s3Key: true },
                        take: 1,
                    },
                },
            },
        },
    });

    const s3Urls = likes.map((like) => getS3Url(like.listing.listingImages[0]?.s3Key));

    return Response.json({ likes, s3Urls });
}
