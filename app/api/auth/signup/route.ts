import { createUser } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await createUser(email, password);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === 'Email already exists' ? 409 : 500 }
    );
  }
}
