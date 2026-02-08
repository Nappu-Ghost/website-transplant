// src/app/api/users/[id]/route.ts
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
        if (!token) {
            return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
        }

        const user = await api.getUserById(params.id, token);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });

    } catch (error: any) {
        console.error(`Error fetching user ${params.id} in API route:`, error.message);
        let statusCode = 500;
        if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
        else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
        else if (error.message?.includes('404')) statusCode = 404;
        return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: statusCode });
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
        const user = await api.updateUser(params.id, data, token);
        return NextResponse.json(user, { status: 200 });

    } catch (error: any) {
        console.error(`Error updating user ${params.id} in API route:`, error.message);
        let statusCode = 500;
        if (error.message?.toLowerCase().includes('unauthorized') || error.message?.includes('401')) statusCode = 401;
        else if (error.message?.toLowerCase().includes('forbidden') || error.message?.includes('403')) statusCode = 403;
        else if (error.message?.includes('400') || error.message?.includes('422')) statusCode = error.message.includes('422') ? 422 : 400;
        else if (error.message?.includes('404')) statusCode = 404;
        return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: statusCode });
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

        await api.deleteUser(params.id, token);
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`Error deleting user ${params.id} in API route:`, error.message);
        let errorMessage = 'Failed to delete user.';
        let statusCode = 500;
        if (error.message) {
            if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
                errorMessage = 'Not authenticated to delete user.'; statusCode = 401;
            } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
                errorMessage = 'Forbidden: You do not have permission.'; statusCode = 403;
            } else if (error.message.includes('409') || error.message.includes('400')) {
                errorMessage = error.message; statusCode = error.message.includes('409') ? 409 : 400;
            } else if (error.message.includes('404')) {
                errorMessage = 'User not found for deletion.'; statusCode = 404;
            }
        }
        return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
    }
}