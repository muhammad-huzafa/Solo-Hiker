import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {

  // Phir se admin check — har admin API route mein yeh hona chahiye
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json(
      { error: "Forbidden — Sirf admin yeh action kar sakta hai" },
      { status: 403 }
    );
  }

  // Request body se tripId nikalo
  const { tripId } = await request.json();

  if (!tripId) {
    return NextResponse.json(
      { error: "tripId provide karo" },
      { status: 400 }
    );
  }

  // Database se trip delete karo
  await prisma.trip.delete({
    where: { id: tripId },
  });

  return NextResponse.json(
    { success: true, message: "Trip successfully delete ho gayi" },
    { status: 200 }
  );
}