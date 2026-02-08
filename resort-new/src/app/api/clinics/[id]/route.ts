// src/app/api/clinics/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

// Helper function to extract ID from URL
function getClinicIdFromUrl(url: string): string | null {
  try {
    const pathSegments = new URL(url).pathname.split('/');
    // Assuming URL is like /api/clinics/[id]
    // pathSegments would be ['', 'api', 'clinics', 'actual_id_value']
    // So, the ID is usually the last segment
    return pathSegments[pathSegments.length - 1] || null;
  } catch (e) {
    console.error("Error parsing URL to get clinic ID:", e);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  // context: { params: { id: string } } // We will get 'id' from request.url
) {
  const clinicId = getClinicIdFromUrl(request.url);
  console.log("[Next API /api/clinics/[id]] GET: Extracted Clinic ID from URL:", clinicId);

  if (!clinicId) {
    return NextResponse.json({ error: 'Clinic ID is missing or invalid in URL' }, { status: 400 });
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    // No !token check here as getClinicById in api.ts is public (requiresAuthToken: false)

    const clinic = await api.getClinicById(clinicId, token);

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }
    return NextResponse.json(clinic, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching clinic ${clinicId}:`, error.message);
    let statusCode = 500;
    if (error.message?.includes('404')) statusCode = 404;
    else if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401; // Should not happen if API is public
    return NextResponse.json({ error: error.message || 'Failed to fetch clinic' }, { status: statusCode });
  }
}

export async function PUT(
  request: NextRequest,
  // context: { params: { id: string } } // Get ID from URL
) {
  const clinicId = getClinicIdFromUrl(request.url);
  console.log("[Next API /api/clinics/[id]] PUT: Extracted Clinic ID from URL:", clinicId);

  if (!clinicId) {
    return NextResponse.json({ error: 'Clinic ID is missing or invalid in URL' }, { status: 400 });
  }

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
    const clinic = await api.updateClinic(clinicId, data, token);
    return NextResponse.json(clinic, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating clinic ${clinicId}:`, error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;
    else if (error.message?.includes('404')) statusCode = 404;
    return NextResponse.json({ error: error.message || 'Failed to update clinic' }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  // context: { params: { id: string } } // Get ID from URL
) {
  const clinicId = getClinicIdFromUrl(request.url);
  console.log("[Next API /api/clinics/[id]] DELETE: Extracted Clinic ID from URL:", clinicId);

  if (!clinicId) {
    return NextResponse.json({ error: 'Clinic ID is missing or invalid in URL' }, { status: 400 });
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await api.deleteClinic(clinicId, token);
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error(`Error deleting clinic ${clinicId}:`, error.message);
    let statusCode = 500;
    if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
    else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
    else if (error.message?.includes('409')) statusCode = 409;
    else if (error.message?.includes('404')) statusCode = 404;
    return NextResponse.json({ error: error.message || 'Failed to delete clinic' }, { status: statusCode });
  }
}