// src/app/api/clinics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // GET /clinics is public via api.ts (requiresAuthToken: false)
    // No explicit token needed to be passed to api.getClinics() if it's public
    // but it can accept one for consistency if other routes pass it.
    const authorizationHeader = request.headers.get('Authorization'); // Optional for GET
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    const clinics = await api.getClinics(token); // api.getClinics will ignore token if requiresAuthToken=false
    return NextResponse.json(clinics, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching clinics in /api/clinics GET:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch clinics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) { // POST createClinic requires authentication
      return NextResponse.json({ error: 'Authentication required to create clinic' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.name || !data.address) {
      return NextResponse.json({ error: 'Name and address are required for clinic' }, { status: 400 });
    }

    // Pass the extracted token to api.createClinic
    const clinic = await api.createClinic(data, token);
    return NextResponse.json(clinic, { status: 201 });
  } catch (error: any) {
    console.error('Error creating clinic in /api/clinics POST:', error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;
    return NextResponse.json({ error: error.message || 'Failed to create clinic' }, { status: statusCode });
  }
}