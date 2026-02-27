import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import api from '@/lib/api';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshCookie = cookieStore.get('refresh_token');

    if (!refreshCookie?.value) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const refreshed = await api.refresh(refreshCookie.value);
    const accessToken = refreshed?.accessToken;
    const refreshToken = refreshed?.refreshToken;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const response = NextResponse.json({ accessToken }, { status: 200 });
    response.cookies.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }
}
