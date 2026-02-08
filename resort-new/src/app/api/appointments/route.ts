// src/app/api/appointments/route.ts
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
    const filters: Record<string, string> = {};
    ['customerId', 'doctorId', 'clinicId', 'status', 'dateFrom', 'dateTo'].forEach(param => {
      const value = searchParams.get(param);
      if (value) filters[param] = value;
    });

    const appointments = await api.getAppointments(Object.keys(filters).length > 0 ? filters : undefined, token);
    return NextResponse.json(appointments, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching appointments in /api/appointments GET:', error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    return NextResponse.json({ error: error.message || 'Failed to fetch appointments' }, { status: statusCode });
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
      return NextResponse.json({ error: 'Authentication required to create appointment' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.clinicId || !data.serviceId || !data.appointmentTime || !data.doctorId || !data.customerId || data.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields (clinicId, serviceId, appointmentTime, doctorId, customerId, price)' },
        { status: 400 }
      );
    }

    const appointment = await api.createAppointment(data, token);
    return NextResponse.json(appointment, { status: 201 });

  } catch (error: any) {
    console.error('Error creating appointment in /api/appointments POST:', error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;

    return NextResponse.json({ error: error.message || 'Failed to create appointment' }, { status: statusCode });
  }
}