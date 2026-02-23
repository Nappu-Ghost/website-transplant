import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import api from '@/lib/api';

export async function GET() {
  try {
    console.log("Check session API called");
    
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (sessionCookie && sessionCookie.value) {
      // Parse the session data from cookie
      try {
        const user = JSON.parse(sessionCookie.value);
        console.log("Session found for user:", user.id);
        
        return NextResponse.json({
          authenticated: true,
          user: user
        });
      } catch (error) {
        console.error('Error parsing cookie session data:', error);
      }
    }

    console.log("No valid session cookie found");
    return NextResponse.json({ 
      authenticated: false,
      user: null 
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}