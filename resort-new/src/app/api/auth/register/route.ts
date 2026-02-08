import { NextResponse } from 'next/server';
import api from '@/lib/api';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name } = data;
    
    console.log('Data received in Next.js API route /api/v1/register:', data);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Register using Python backend
    const user = await api.register({ email, password, name });

    // After successful registration, log the user in automatically
    try {
      // Get the token from login
      const tokenResponse = await api.login(email, password);
      
      if (tokenResponse && tokenResponse.accessToken) {
        // Get the full user profile with the token
        const currentUserData = await api.getCurrentUser(tokenResponse.accessToken);
        
        // Create a response with JSON data
        const response = NextResponse.json({
          message: 'User registered and logged in successfully',
          user: currentUserData,
          accessToken: tokenResponse.accessToken
        }, { status: 201 });

        // Set the session cookie for middleware authentication
        response.cookies.set({
          name: 'user_session',
          value: JSON.stringify(currentUserData),
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: 'strict',
        });

        return response;
      }
    } catch (loginError) {
      console.error('Auto-login after registration failed:', loginError);
      // If auto-login fails, still return the successful registration
      return NextResponse.json({
        message: 'User registered successfully, but auto-login failed. Please log in manually.',
        user
      }, { status: 201 });
    }

    // Fallback in case auto-login logic had an issue
    return NextResponse.json({
      message: 'User registered successfully',
      user
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('already registered')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}