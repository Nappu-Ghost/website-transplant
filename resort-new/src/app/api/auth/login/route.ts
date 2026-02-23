// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { User } from '@/lib/auth'; // Assuming User interface is exported from auth.ts or a types file

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const tokenResponse = await api.login(email, password);

    if (tokenResponse && tokenResponse.accessToken) {
      try {
        const currentUserData: User = await api.getCurrentUser(tokenResponse.accessToken);

        if (!currentUserData || !currentUserData.id) {
          return NextResponse.json(
            { error: 'Login succeeded, but failed to retrieve user profile.' },
            { status: 500 }
          );
        }        // Create a response with JSON data
        const response = NextResponse.json({
          message: 'Login successful',
          user: currentUserData,
          accessToken: tokenResponse.accessToken
        }, { status: 200 });

        // Set the session cookie for middleware authentication
        response.cookies.set({
          name: 'user_session',
          value: JSON.stringify(currentUserData),
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
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

      } catch (fetchUserError: any) {
        console.error('Failed to fetch user details after login:', fetchUserError.message);
        return NextResponse.json(
          { error: 'Login successful, but failed to retrieve user details. Please try again.', details: fetchUserError.message },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Login failed: No valid token received from backend.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Login error in POST /api/auth/login:', error.message);
    let errorMessage = 'Authentication failed. Please check your credentials.';
    let statusCode = 500;

    if (error.message) {
      if (error.message.toLowerCase().includes('incorrect email or password') || error.message.includes('HTTP error! status: 401')) {
        errorMessage = 'Incorrect email or password.';
        statusCode = 401;
      } else if (error.message.toLowerCase().includes('inactive user') || error.message.includes('HTTP error! status: 400')) {
        errorMessage = 'Account is inactive.';
        statusCode = 400;
      } else if (error.message.includes('HTTP error! status: 404')) {
        errorMessage = 'Login service endpoint not found.';
        statusCode = 404;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}