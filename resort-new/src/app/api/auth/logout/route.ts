import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : null;

    if (token) {
      try {
        await api.logout(token);
      } catch (e) {
      }
    }

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

    response.cookies.set({
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
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