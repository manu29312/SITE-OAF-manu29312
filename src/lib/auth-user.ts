import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const LOCAL_AUTH_USER_ID = process.env.LOCAL_DEV_AUTH_USER_ID ?? 'seed-user-auth-id';
const LOCAL_AUTH_EMAIL = process.env.LOCAL_DEV_AUTH_EMAIL ?? 'local@site-oaf.app';
const LOCAL_AUTH_NAME = process.env.LOCAL_DEV_AUTH_NAME ?? 'Local User';

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

type SupabaseSessionInfo = {
  userId: string;
  email: string | null;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readSupabaseSessionFromCookies(): SupabaseSessionInfo | null {
  const allCookies = cookies().getAll();
  const authCookie = allCookies.find((cookie) => {
    return cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token');
  });

  if (!authCookie?.value) {
    return null;
  }

  let token: string | null = null;

  try {
    const parsed = JSON.parse(authCookie.value) as unknown;
    if (parsed && typeof parsed === 'object' && 'access_token' in parsed) {
      token = String((parsed as { access_token?: unknown }).access_token ?? '');
    }
  } catch {
    token = authCookie.value;
  }

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const userId = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email : null;

  if (!userId) {
    return null;
  }

  return { userId, email };
}

export async function requireAuthUserId(): Promise<string> {
  if (isLocalDevAuthEnabled()) {
    return LOCAL_AUTH_USER_ID;
  }

  const session = readSupabaseSessionFromCookies();
  const userId = session?.userId ?? null;
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  return userId;
}

export async function requireAuthUserIdOrRedirect(): Promise<string> {
  if (isLocalDevAuthEnabled()) {
    return LOCAL_AUTH_USER_ID;
  }

  const session = readSupabaseSessionFromCookies();
  const userId = session?.userId ?? null;
  if (!userId) {
    return redirect('/') as never;
  }

  return userId;
}

export async function ensureAppUser(authUserId: string): Promise<string> {
  const session = isLocalDevAuthEnabled() ? null : readSupabaseSessionFromCookies();
  const email = isLocalDevAuthEnabled()
    ? LOCAL_AUTH_EMAIL
    : session?.email ?? null;
  const name = isLocalDevAuthEnabled()
    ? LOCAL_AUTH_NAME
    : null;

  try {
    const user = await prisma.user.upsert({
      where: { authUserId: authUserId },
      update: {
        email,
        name,
      },
      create: {
        authUserId: authUserId,
        email,
        name,
      },
      select: { id: true },
    });

    return user.id;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return authUserId;
    }

    throw error;
  }
}
