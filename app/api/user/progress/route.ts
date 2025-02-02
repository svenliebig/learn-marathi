import { getTokenPayload } from '@/lib/context/auth/utils';
import { progressService } from '@/lib/services/progress-service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get auth token from cookie
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader
      ?.split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const payload = await getTokenPayload(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user progress
    const progress = await progressService.getUserProgress(payload.userId);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Failed to fetch user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get auth token from cookie
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader
      ?.split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const payload = await getTokenPayload(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { mode, letter, answer } = await request.json();
    const progress = await progressService.updateProgress(
      payload.userId,
      mode,
      letter,
      answer === 'correct'
    );

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Failed to update progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
