// src/app/api/shifts/route.ts
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
            return NextResponse.json({ error: 'Authentication token is missing', detail: 'No authorization token found.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filters: Record<string, any> = {};
        ['clinicId', 'doctorId', 'date', 'startDate', 'endDate', 'shiftTime'].forEach(param => {
            const value = searchParams.get(param);
            if (value !== null) {
                filters[param] = value;
            }
        });

        const shiftsData = await api.getShifts(Object.keys(filters).length > 0 ? filters : undefined, token);
        return NextResponse.json(shiftsData, { status: 200 });

    } catch (error: any) {
        console.error("Error in Next.js API /api/shifts GET:", error.message);
        let errorMessage = 'Failed to fetch shifts.';
        let errorDetail = error.message;
        let statusCode = 500;

        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated to fetch shifts.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden: You do not have permission.'; statusCode = 403;
            } else if (error.message.includes('HTTP error! status:')) {
                const match = error.message.match(/status: (\d+)/);
                if (match && match[1]) statusCode = parseInt(match[1]);
                errorMessage = error.message;
            }
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
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

        if (!data.doctorId || !data.clinicId || !data.date || !data.shiftTime) {
            return NextResponse.json(
                { error: 'Doctor ID, Clinic ID, date, and shift time are required for creating a shift.' },
                { status: 400 }
            );
        }

        const shift = await api.createShift(data, token);
        return NextResponse.json(shift, { status: 201 });

    } catch (error: any) {
        console.error('Error creating shift in /api/shifts POST:', error.message);
        let errorMessage = 'Failed to create shift.';
        let errorDetail = error.message;
        let statusCode = 500;
        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden.'; statusCode = 403;
            } else if (error.message.includes('HTTP error! status:')) {
                const match = error.message.match(/status: (\d+)/);
                if (match && match[1]) statusCode = parseInt(match[1]);
                errorMessage = error.message;
            } else if (error.message.includes('400') || error.message.includes('422')) {
                errorMessage = error.message;
                statusCode = error.message.includes('422') ? 422 : 400;
            }
        }
        return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
    }
}