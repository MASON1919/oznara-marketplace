import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'User IDs are required' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    const usersById = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    return NextResponse.json(usersById);
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
