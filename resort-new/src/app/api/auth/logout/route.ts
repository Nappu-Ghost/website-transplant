import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response
    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    // Clear the session cookie
    response.cookies.set({
      name: 'user_session',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0, // Expire immediately
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}