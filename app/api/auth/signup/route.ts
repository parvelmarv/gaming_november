import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    // TODO: Implement user creation without Prisma
    return NextResponse.json({
      user: {
        email,
        name
      }
    });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 