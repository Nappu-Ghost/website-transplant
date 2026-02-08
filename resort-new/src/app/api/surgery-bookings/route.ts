// src/app/api/surgery-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api'; // Your ApiClient from src/lib/api.ts

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
        const filters: Record<string, any> = {};
        ['clinicId', 'doctorId', 'date'].forEach(param => { // Add other filters if needed
            const value = searchParams.get(param);
            if (value !== null) {
                filters[param] = value;
            }
        });

        const bookingsData = await api.getSurgeryBookings(Object.keys(filters).length > 0 ? filters : undefined, token);
        return NextResponse.json(bookingsData, { status: 200 });

    } catch (error: any) {
        console.error("Error in Next.js API /api/surgery-bookings GET:", error.message);
        let errorMessage = 'Failed to fetch surgery bookings.';
        let statusCode = 500;
        if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) {
            statusCode = 401;
            errorMessage = 'Not authenticated to fetch surgery bookings.';
        } else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) {
            statusCode = 403;
            errorMessage = 'Forbidden: You do not have permission.';
        } else if (error.message?.includes('HTTP error! status:')) {
            const match = error.message.match(/status: (\d+)/);
            if (match && match[1]) statusCode = parseInt(match[1]);
            if (statusCode === 404) errorMessage = "Surgery bookings endpoint not found by backend or no data for query.";
        }
        return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
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

        if (!data.doctorId || !data.clinicId || !data.date || !data.startTime || !data.endTime || !data.procedure) {
            return NextResponse.json(
                { error: 'Missing required fields for surgery booking.' },
                { status: 400 }
            );
        }

        const booking = await api.createSurgeryBooking(data, token);
        return NextResponse.json(booking, { status: 201 });

    } catch (error: any) {
        console.error('Error creating surgery booking in /api/surgery-bookings POST:', error.message);
        let errorMessage = 'Failed to create surgery booking.';
        let statusCode = 500;
        if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
        else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
        else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;

        return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
    }
}