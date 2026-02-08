// src/app/api/surgery-bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
    const params = await paramsPromise;
    // console.log("[Next API /api/surgery-bookings/[id]] GET received. Resolved Params:", JSON.stringify(params, null, 2));

    if (!params || !params.id) {
        console.error("[Next API /api/surgery-bookings/[id]] GET: ID not found in resolved params.");
        return NextResponse.json({ error: 'Booking ID is missing from route parameters' }, { status: 400 });
    }
    const bookingId = params.id;
    console.log("[Next API /api/surgery-bookings/[id]] GET: Extracted Booking ID:", bookingId);

    try {
        const authorizationHeader = request.headers.get('Authorization');
        let token: string | null = null;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            token = authorizationHeader.substring(7);
        }
        if (!token) {
            return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
        }

        // Assuming you will add getSurgeryBookingById in api.ts
        // const booking = await api.getSurgeryBookingById(bookingId, token);
        // For now, using a placeholder. Replace this with the actual API call.
        // If api.getSurgeryBookingById doesn't exist yet, this GET route won't be fully functional.
        // To make it testable for now without an actual api.getSurgeryBookingById:
        console.warn(`[Next API /api/surgery-bookings/[id]] GET: Using placeholder for booking ID ${bookingId}. Implement api.getSurgeryBookingById for actual data.`);
        // const booking = await Promise.resolve({ id: bookingId, details: `Details for surgery booking ${bookingId}` });

        // To make it work, let's assume for now this route is primarily for PUT/DELETE and GET by ID isn't fully implemented.
        // Or, if you have a generic get by ID in your API that you can call, use that.
        // For instance, if your backend supports a generic GET and your api.ts can make it:
        // const booking = await api.request(`/surgery-bookings/${bookingId}`, { method: 'GET' }, undefined, true, token);

        // If you definitely don't have a getSurgeryBookingById method in api.ts yet
        // and this GET route is not meant to be used, you can return a 404 or 501.
        return NextResponse.json({ error: `GET by ID for surgery booking ${bookingId} not fully implemented in API route yet.` }, { status: 501 });

        // If you had the method:
        // if (!booking) {
        //     return NextResponse.json({ error: 'Surgery booking not found' }, { status: 404 });
        // }
        // return NextResponse.json(booking, { status: 200 });

    } catch (error: any) {
        console.error(`[Next API /api/surgery-bookings/[id]] GET: Error fetching surgery booking ${bookingId}:`, error.message, error.stack);
        let errorMessage = 'Failed to fetch surgery booking.';
        let errorDetail = error.message;
        let statusCode = 500;
        if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
        else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
        else if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) statusCode = 404;
        else if (error.message?.includes('HTTP error! status:')) {
            const match = error.message.match(/status: (\d+)/);
            if (match && match[1]) {
                statusCode = parseInt(match[1]);
                const detailMatch = error.message.match(/message: (.*)/i);
                errorMessage = detailMatch && detailMatch[1] ? detailMatch[1] : error.message;
            } else {
                errorMessage = error.message;
            }
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
    }
}

export async function PUT(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
    const params = await paramsPromise;
    // console.log("[Next API /api/surgery-bookings/[id]] PUT received. Resolved Params:", JSON.stringify(params, null, 2));

    if (!params || !params.id) {
        console.error("[Next API /api/surgery-bookings/[id]] PUT: ID not found in resolved params.");
        return NextResponse.json({ error: 'Booking ID is missing from route parameters' }, { status: 400 });
    }
    const bookingId = params.id;
    console.log("[Next API /api/surgery-bookings/[id]] PUT: Extracted Booking ID:", bookingId);

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
        console.log(`[Next API /api/surgery-bookings/[id]] PUT: Parsed request body for ID ${bookingId}:`, data);

        const booking = await api.updateSurgeryBooking(bookingId, data, token);
        console.log(`[Next API /api/surgery-bookings/[id]] PUT: Response from api.updateSurgeryBooking for ID ${bookingId}:`, booking);

        return NextResponse.json(booking, { status: 200 });

    } catch (error: any) {
        console.error(`[Next API /api/surgery-bookings/[id]] PUT: Error updating surgery booking ${bookingId}:`, error.message, error.stack);
        let errorMessage = 'Failed to update surgery booking.';
        let errorDetail = error.message;
        let statusCode = 500;
        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden.'; statusCode = 403;
            } else if (error.message.includes('HTTP error! status:')) {
                const match = error.message.match(/status: (\d+)/);
                if (match && match[1]) {
                    statusCode = parseInt(match[1]);
                    const detailMatch = error.message.match(/message: (.*)/i);
                    errorMessage = detailMatch && detailMatch[1] ? detailMatch[1] : error.message;
                } else {
                    errorMessage = error.message;
                }
            } else if (error.message.includes('400') || error.message.includes('422')) {
                // Use the detailed error message from backend for validation issues
                const detailMatch = error.message.match(/message: (.*)/i);
                errorMessage = detailMatch && detailMatch[1] ? detailMatch[1] : error.message;
                statusCode = error.message.includes('422') ? 422 : 400;
            } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                errorMessage = 'Surgery booking not found.'; statusCode = 404;
            }
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
    }
}

export async function DELETE(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
    const params = await paramsPromise;
    // console.log("[Next API /api/surgery-bookings/[id]] DELETE received. Resolved Params:", JSON.stringify(params, null, 2));

    if (!params || !params.id) {
        console.error("[Next API /api/surgery-bookings/[id]] DELETE: ID not found in resolved params.");
        return NextResponse.json({ error: 'Booking ID is missing from route parameters' }, { status: 400 });
    }
    const bookingId = params.id;
    console.log("[Next API /api/surgery-bookings/[id]] DELETE: Extracted Booking ID:", bookingId);

    try {
        const authorizationHeader = request.headers.get('Authorization');
        let token: string | null = null;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            token = authorizationHeader.substring(7);
        }
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        await api.deleteSurgeryBooking(bookingId, token);
        console.log(`[Next API /api/surgery-bookings/[id]] DELETE: Successfully processed delete for booking ${bookingId}.`);
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`[Next API /api/surgery-bookings/[id]] DELETE: Error deleting surgery booking ${bookingId}:`, error.message, error.stack);
        let errorMessage = 'Failed to delete surgery booking.';
        let errorDetail = error.message;
        let statusCode = 500;
        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden.'; statusCode = 403;
            } else if (error.message.includes('HTTP error! status:')) {
                const match = error.message.match(/status: (\d+)/);
                if (match && match[1]) {
                    statusCode = parseInt(match[1]);
                    const detailMatch = error.message.match(/message: (.*)/i);
                    errorMessage = detailMatch && detailMatch[1] ? detailMatch[1] : error.message;
                } else {
                    errorMessage = error.message;
                }
            } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                errorMessage = 'Surgery booking not found.'; statusCode = 404;
            } else if (error.message.includes('409')) { // Conflict
                errorMessage = error.message; statusCode = 409;
            }
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
    }
}