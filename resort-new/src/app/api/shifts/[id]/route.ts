// src/app/api/shifts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
    const params = await paramsPromise;

    try {
        const authorizationHeader = request.headers.get('Authorization');
        let token: string | null = null;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            token = authorizationHeader.substring(7);
        }
        if (!token) {
            return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
        }

        // Assuming you will add getShiftById in api.ts
        // const shift = await api.getShiftById(params.id, token);
        // return NextResponse.json(shift, { status: 200 });

        console.warn(`[Next API /api/shifts/[id]] GET: Using placeholder for shift ID ${params.id}. Implement api.getShiftById for actual data.`);
        return NextResponse.json({ error: `GET by ID for shift '${params.id}' not implemented in this API route yet.` }, { status: 501 });


    } catch (error: any) {
        console.error(`Error fetching shift ${params.id} in API route:`, error.message, error.stack);
        let errorMessage = 'Failed to fetch shift.';
        let errorDetail = error.message;
        let statusCode = 500;

        if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) {
            statusCode = 401;
            errorMessage = 'Not authenticated.';
        } else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) {
            statusCode = 403;
            errorMessage = 'Forbidden.';
        } else if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
            statusCode = 404;
            errorMessage = 'Shift not found.';
        } else if (error.message?.includes('HTTP error! status:')) {
            const statusMatch = error.message.match(/status: (\d+)/);
            if (statusMatch && statusMatch[1]) {
                statusCode = parseInt(statusMatch[1]);
            }
            const messageMatch = error.message.match(/message: (.*)/i);
            errorMessage = messageMatch && messageMatch[1] ? messageMatch[1] : error.message;
        } else {
            errorMessage = error.message || 'An unexpected error occurred.';
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
    }
}


export async function PUT(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
    const params = await paramsPromise;

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
        const shift = await api.updateShift(params.id, data, token);
        return NextResponse.json(shift, { status: 200 });

    } catch (error: any) {
        console.error(`Error updating shift ${params.id} in API route:`, error.message, error.stack);
        let errorMessage = 'Failed to update shift.';
        let errorDetail = error.message;
        let statusCode = 500;

        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden.'; statusCode = 403;
            } else if (error.message.includes('HTTP error! status:')) {
                const statusMatch = error.message.match(/status: (\d+)/);
                if (statusMatch && statusMatch[1]) {
                    statusCode = parseInt(statusMatch[1]);
                }
                const messageMatch = error.message.match(/message: (.*)/i);
                errorMessage = messageMatch && messageMatch[1] ? messageMatch[1] : error.message;
            } else if (error.message.includes('400') || error.message.includes('422')) {
                // For 400/422, the error.message from api.ts should already be the detailed backend message
                errorMessage = error.message;
                statusCode = error.message.includes('422') ? 422 : 400;
            } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                errorMessage = 'Shift not found.'; statusCode = 404;
            } else {
                errorMessage = error.message || 'An unexpected error occurred while updating.';
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

    try {
        const authorizationHeader = request.headers.get('Authorization');
        let token: string | null = null;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            token = authorizationHeader.substring(7);
        }
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        await api.deleteShift(params.id, token);
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`Error deleting shift ${params.id} in API route:`, error.message, error.stack);
        let errorMessage = 'Failed to delete shift.';
        let errorDetail = error.message;
        let statusCode = 500;

        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden.'; statusCode = 403;
            } else if (error.message.includes('HTTP error! status:')) {
                const statusMatch = error.message.match(/status: (\d+)/);
                if (statusMatch && statusMatch[1]) {
                    statusCode = parseInt(statusMatch[1]);
                }
                const messageMatch = error.message.match(/message: (.*)/i);
                errorMessage = messageMatch && messageMatch[1] ? messageMatch[1] : error.message;
            } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
                errorMessage = 'Shift not found.'; statusCode = 404;
            } else if (error.message.includes('409')) { // Conflict
                errorMessage = error.message; statusCode = 409;
            } else {
                errorMessage = error.message || 'An unexpected error occurred while deleting.';
            }
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
    }
}