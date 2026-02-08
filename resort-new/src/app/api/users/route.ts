// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};
    ['role', 'status', 'email', 'name'].forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        filters[param] = value;
      }
    });

    const users = await api.getUsers(Object.keys(filters).length > 0 ? filters : undefined, token);
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error in Next.js API /api/users GET:", error.message);
    let statusCode = 500;
    if (error.message) {
      if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
        statusCode = 401;
      } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
        statusCode = 403;
      }
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const data = await request.json();

    // Add any specific validation for admin user creation if necessary
    if (!data.email || !data.password || !data.role) {
      return NextResponse.json({ error: 'Email, password, and role are required for creating a user.' }, { status: 400 });
    }

    const user = await api.createUser(data, token);
    return NextResponse.json(user, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user in /api/users POST:', error.message);
    let statusCode = 500;
    if (error.message) {
      if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
        statusCode = 401;
      } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
        statusCode = 403;
      } else if (error.message.includes('400') || error.message.includes('422')) {
        statusCode = error.message.includes('422') ? 422 : 400;
      }
    }
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: statusCode });
  }
}