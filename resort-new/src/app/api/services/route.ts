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
    const services = await api.getServices();
    const servicesArray = Array.isArray(services) ? services : [];
    return NextResponse.json(servicesArray);
  } catch (error: any) {
    console.error('[API Route /services] Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services', detail: error.detail, services: [] },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('[API Route /services POST] Received headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  const token = getAuthToken(request);
  console.log('[API Route /services POST] Token extracted by getAuthToken:', token);

  if (!token) {
    return NextResponse.json({ error: 'Authentication required. No token provided.' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.name || data.priceMorning === undefined || data.priceAfternoon === undefined || data.priceEvening === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, priceMorning, priceAfternoon, priceEvening are required.' },
        { status: 400 }
      );
    }

    const service = await api.createService(data, token);
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /services POST] Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}