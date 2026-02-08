import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId') || undefined;
    const tickets = await api.getFerryTickets(scheduleId || undefined);
    const ticketsArray = Array.isArray(tickets) ? tickets : [];
    return NextResponse.json(ticketsArray, { status: 200 });
  } catch (error: any) {
    console.error('[API Route /ferry-tickets] Error fetching tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ferry tickets', detail: error.detail, tickets: [] },
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
    if (!data.scheduleId || !data.passengerName) {
      return NextResponse.json(
        { error: 'Missing required fields: scheduleId and passengerName are required.' },
        { status: 400 }
      );
    }

    const ticket = await api.createFerryTicket(data, token);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error('[API Route /ferry-tickets POST] Error creating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ferry ticket', detail: error.detail },
      { status: error.status || 500 }
    );
  }
}
