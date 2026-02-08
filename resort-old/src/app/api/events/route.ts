import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'asc'
      }
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, isPremium } = body;

    const event = await prisma.event.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isPremium: isPremium || false,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Error creating event" }, { status: 500 });
  }
}