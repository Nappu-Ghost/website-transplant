// src/app/api/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // For public endpoints, token extraction is optional but can be useful for conditional logic
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }

    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};
    ['clinicId', 'status', 'specialty', 'includeUnassigned'].forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        if (param === 'includeUnassigned') {
          filters[param] = value.toLowerCase() === 'true';
        } else {
          filters[param] = value;
        }
      }
    });

    // api.getDoctors will now call with requiresAuthToken: false internally
    const doctors = await api.getDoctors(Object.keys(filters).length > 0 ? filters : undefined, token);
    return NextResponse.json(doctors, { status: 200 });

  } catch (error: any) {
    console.error("Error in Next.js API /api/doctors GET:", error.message);
    // Since FastAPI endpoint is now public, 401/403 from FastAPI less likely for this specific call
    // unless there's an issue with the public access setup or other middleware.
    // The error is more likely to be a 500 if FastAPI has an issue.
    let statusCode = 500;
    if (error.message?.includes('HTTP error! status:')) {
      const match = error.message.match(/status: (\d+)/);
      if (match && match[1]) statusCode = parseInt(match[1]);
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch doctors' }, { status: statusCode });
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

    if (!data.clinicId && !(data.userEmail && data.userName && data.userPassword && (data.userId === null || data.userId === '' || data.userId === undefined))) {
      return NextResponse.json(
        { error: 'Clinic assignment is required, or new user details (email, name, password) must be provided if not linking an existing user.' },
        { status: 400 }
      );
    }

    const doctor = await api.createDoctor(data, token);
    return NextResponse.json(doctor, { status: 201 });

  } catch (error: any) {
    console.error('Error creating doctor in /api/doctors POST:', error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;

    return NextResponse.json({ error: error.message || 'Failed to create doctor' }, { status: statusCode });
  }
}