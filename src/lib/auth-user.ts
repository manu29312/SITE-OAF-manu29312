import { prisma } from '@/lib/prisma';

const LOCAL_USER_ID = 'local-user';

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
  return LOCAL_USER_ID;
}

export async function requireClerkUserIdOrRedirect(): Promise<string> {
  return LOCAL_USER_ID;
}

export async function ensureAppUser(clerkUserId: string): Promise<string> {
  const email = 'local@site-oaf.app';
  const name = 'Local User';

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
