import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  
  // Server side par dobara check karo ke admin hai
  // Middleware page protect karta hai, lekin API route
  // directly bhi call ho sakta hai — isliye double check zaroori hai
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json(
      { error: "Forbidden — Sirf admin yeh action kar sakta hai" },
      { status: 403 }
    );
  }

  // Request body se userId nikalo
  const { userId } = await request.json();

  // Safety check — userId mila ya nahi
  if (!userId) {
    return NextResponse.json(
      { error: "userId provide karo" },
      { status: 400 }
    );
  }

  // Database se user delete karo
  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json(
    { success: true, message: "User successfully delete ho gaya" },
    { status: 200 }
  );
}
