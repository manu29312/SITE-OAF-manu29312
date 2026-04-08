import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

function isDatabaseUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === 'PrismaClientInitializationError' ||
    error.message.includes("Can't reach database server") ||
    error.message.includes('P1001')
  );
}

export async function requireClerkUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return userId;
}

export async function ensureAppUser(clerkUserId: string): Promise<string> {
  const clerkProfile = await currentUser();
  const email = clerkProfile?.emailAddresses[0]?.emailAddress;
  const name =
    [clerkProfile?.firstName, clerkProfile?.lastName].filter(Boolean).join(' ') ||
    clerkProfile?.username ||
    null;

  try {
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        email,
        name,
      },
      create: {
        clerkId: clerkUserId,
        email,
        name,
      },
      select: { id: true },
    });

    return user.id;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return clerkUserId;
    }

    throw error;
  }
}
