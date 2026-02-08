import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// GET /api/activities
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST /api/activities
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, activityType, price, capacity, imageUrl, isPremium } = body;

    const activity = await prisma.activity.create({
      data: {
        name,
        activityType,
        price,
        capacity,
        imageUrl,
        isPremium: isPremium || false
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

// PUT /api/activities
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    const body = await request.json();
    const { name, activityType, price, capacity, imageUrl, isPremium } = body;

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name,
        activityType,
        price,
        capacity,
        imageUrl,
        isPremium
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

// DELETE /api/activities
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    await prisma.activity.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}