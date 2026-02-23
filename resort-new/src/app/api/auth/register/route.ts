import { NextResponse } from 'next/server';
import api from '@/lib/api';
import { isApiError, getApiErrorMessage } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name } = data;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await api.register({ email, password, name });

    try {
      const tokenResponse = await api.login(email, password);

      if (tokenResponse && tokenResponse.accessToken) {
        const currentUserData = await api.getCurrentUser(tokenResponse.accessToken);

        const response = NextResponse.json({
          message: 'User registered and logged in successfully',
          user: currentUserData,
          accessToken: tokenResponse.accessToken
        }, { status: 201 });

        response.cookies.set({
          name: 'user_session',
          value: JSON.stringify(currentUserData),
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'strict',
        });

        if (tokenResponse.refreshToken) {
          response.cookies.set({
            name: 'refresh_token',
            value: tokenResponse.refreshToken,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 14,
            sameSite: 'strict',
          });
        }

        return response;
      }
    } catch {
      return NextResponse.json({
        message: 'User registered successfully, but auto-login failed. Please log in manually.',
        user
      }, { status: 201 });
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user
    }, { status: 201 });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        { error: getApiErrorMessage(error, 'Registration failed') },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
