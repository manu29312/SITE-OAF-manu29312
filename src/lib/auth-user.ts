import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const LOCAL_USER_ID = 'local-user';

export function isLocalDevAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.LOCAL_DEV_AUTH === 'true';
}

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
  if (isLocalDevAuthEnabled()) {
    return LOCAL_USER_ID;
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  return userId;
}

export async function requireClerkUserIdOrRedirect(): Promise<string> {
  if (isLocalDevAuthEnabled()) {
    return LOCAL_USER_ID;
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: '/dashboard' }) as never;
  }

  return userId;
}

export async function ensureAppUser(clerkUserId: string): Promise<string> {
  const clerkProfile = isLocalDevAuthEnabled() ? null : await currentUser();
  const email = isLocalDevAuthEnabled()
    ? 'local@site-oaf.app'
    : clerkProfile?.emailAddresses[0]?.emailAddress ?? null;
  const name = isLocalDevAuthEnabled()
    ? 'Local User'
    : [clerkProfile?.firstName, clerkProfile?.lastName].filter(Boolean).join(' ') ||
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
