import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching event" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, isPremium } = body;

    const event = await prisma.event.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isPremium,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Error updating event" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting event" }, { status: 500 });
  }
}