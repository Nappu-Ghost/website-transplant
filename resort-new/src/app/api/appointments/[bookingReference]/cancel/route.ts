// src/app/api/appointments/[bookingReference]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming prisma client is correctly set up
// import api from '@/lib/api'; // Not used if directly using prisma
// import { auth } from '@/lib/auth'; // Not used for getting token from header here

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingReference: string } }
) {
  try {
    // --- Add Authentication Check ---
    const authorizationHeader = request.headers.get('Authorization');
    let token: string | null = null;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.substring(7);
    }
    // If cancellation requires a logged-in user (e.g., only the user who booked or an admin can cancel)
    // You would validate this token against your FastAPI backend (e.g., by calling api.getCurrentUser(token))
    // For simplicity, if just any valid token is enough for this Next.js route to proceed:
    if (!token) {
      return NextResponse.json({ error: 'Authentication required to cancel appointment' }, { status: 401 });
    }
    // If you need to verify the user associated with the token has permission to cancel *this specific* appointment,
    // that logic would go here, potentially by calling a FastAPI endpoint that does this check.

    // The rest of your Prisma logic
    const appointment = await prisma.appointment.update({
      where: {
        bookingReference: params.bookingReference
      },
      data: {
        status: "CANCELLED" // Ensure "CANCELLED" is a valid enum value in your Prisma schema/DB
      },
      include: { // Prisma include, not FastAPI response model include
        clinic: { select: { name: true } },
        service: { select: { name: true } }
        // You might want to include doctor and customer as well if needed by client
      }
    });

    // The response here should match what your client-side code expects.
    // If it expects the same structure as other appointment responses, you might need to transform it.
    // For now, returning the prisma result directly.
    return NextResponse.json(appointment, { status: 200 }); // 200 OK for successful update

  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    let errorMessage = 'Failed to cancel appointment.';
    let statusCode = 500;

    if (error.code === 'P2025') { // Prisma specific error for record not found
      errorMessage = 'Appointment not found.';
      statusCode = 404;
    } else if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) {
      errorMessage = 'Not authorized to cancel this appointment.';
      statusCode = 401;
    } else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) {
      errorMessage = 'Forbidden to cancel this appointment.';
      statusCode = 403;
    }

    return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
  }
}