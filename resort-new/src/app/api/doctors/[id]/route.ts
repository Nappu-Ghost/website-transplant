// src/app/api/doctors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    // api.getDoctorById will call with requiresAuthToken: false internally

    const doctor = await api.getDoctorById(params.id, token);

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    return NextResponse.json(doctor, { status: 200 });

  } catch (error: any) {
    console.error(`Error fetching doctor ${params.id} in API route:`, error.message);
    let statusCode = 500;
    if (error.message?.includes('HTTP error! status:')) {
      const match = error.message.match(/status: (\d+)/);
      if (match && match[1]) statusCode = parseInt(match[1]);
    }
    if (statusCode === 500 && error.message?.toLowerCase().includes('not found')) statusCode = 404; // If handleResponse threw generic "not found"

    return NextResponse.json({ error: error.message || 'Failed to fetch doctor' }, { status: statusCode });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const doctor = await api.updateDoctor(params.id, data, token);
    return NextResponse.json(doctor, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating doctor ${params.id} in API route:`, error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;
    else if (error.message?.includes('404')) statusCode = 404;

    return NextResponse.json({ error: error.message || 'Failed to update doctor' }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await api.deleteDoctor(params.id, token);
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error(`Error deleting doctor ${params.id} in API route:`, error.message);
    let errorMessage = 'Failed to delete doctor.';
    let statusCode = 500;
    if (error.message) {
      if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
        errorMessage = 'Not authenticated to delete doctor.'; statusCode = 401;
      } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
        errorMessage = 'Forbidden: You do not have permission.'; statusCode = 403;
      } else if (error.message.includes('has existing') || error.message.includes('409') || error.message.includes('400')) {
        errorMessage = error.message; statusCode = error.message.includes('409') ? 409 : 400;
      } else if (error.message.includes('404')) {
        errorMessage = 'Doctor not found for deletion.'; statusCode = 404;
      }
    }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
  }
}