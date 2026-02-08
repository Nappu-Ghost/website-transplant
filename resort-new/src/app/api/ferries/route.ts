import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function GET() {
  try {
    const ferries = await api.getFerries();
    const ferriesArray = Array.isArray(ferries) ? ferries : [];
    return NextResponse.json(ferriesArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferries] Error fetching ferries:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ferries', detail: error.detail, ferries: [] },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Missing required field: name is required.' }, { status: 400 });
    }

    const ferry = await api.createFerry(data, token);
    return NextResponse.json(ferry, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /ferries POST] Error creating ferry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ferry', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
