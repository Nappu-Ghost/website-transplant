import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(
  request: NextRequest,
  context: { params: { bookingReference: string } }
) {
  const { bookingReference } = context.params;

  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
    }

    const appointment = await api.getAppointmentByRef(bookingReference, token);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment, { status: 200 });

  } catch (error: any) {
    console.error(
      `Error fetching appointment ${bookingReference}: Message: "${error.message}"`,
      error.detail || error
    );

    const statusCode = error.status || 500;
    const displayMessage = error.message || 'Failed to fetch appointment';
    const responseDetail = error.detail;

    return NextResponse.json({ error: displayMessage, detail: responseDetail }, { status: statusCode });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { bookingReference: string } }
) {
  const { bookingReference } = context.params;

  try {
    const data = await request.json();
    const authorizationHeader = request.headers.get('Authorization');

    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const appointment = await api.updateAppointment(bookingReference, data, token);
    return NextResponse.json(appointment, { status: 200 });

  } catch (error: any) {
    console.error(
      `Error updating appointment ${bookingReference}: Message: "${error.message}"`,
      error.detail || error
    );

    const statusCode = error.status || 500;
    const displayMessage = error.message || 'Failed to update appointment';
    const responseDetail = error.detail;

    return NextResponse.json({ error: displayMessage, detail: responseDetail }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { bookingReference: string } }
) {
  const { bookingReference } = context.params;
  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await api.deleteAppointment(bookingReference, token);
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error(
      `Error deleting appointment ${bookingReference}: Message: "${error.message}"`,
      error.detail || error
    );

    const statusCode = error.status || 500;
    const displayMessage = error.message || 'Failed to delete appointment';
    const responseDetail = error.detail;

    return NextResponse.json({ error: displayMessage, detail: responseDetail }, { status: statusCode });
  }
}