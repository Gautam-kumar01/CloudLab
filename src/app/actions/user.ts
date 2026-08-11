"use server";

import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";

export async function deleteUserAccount() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Delete the user from the database. 
  // Prisma Cascade will automatically delete their projects, workspaces, and active sessions!
  await db.user.delete({
    where: { id: session.user.id }
  });

  // Sign out the user
  await signOut({ redirectTo: "/" });
}
