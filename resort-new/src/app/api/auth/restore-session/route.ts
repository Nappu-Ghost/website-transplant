import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Invalid user data provided' },
        { status: 400 }
      );
    }

    // Create a response
    const response = NextResponse.json({
      message: 'Session restored successfully',
    });

    // Set the session cookie
    response.cookies.set({
      name: 'user_session',
      value: JSON.stringify(user),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Session restore error:', error);
    return NextResponse.json(
      { message: 'An error occurred during session restoration' },
      { status: 500 }
    );
  }
}
