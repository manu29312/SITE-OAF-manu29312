import { PrismaClient } from '@prisma/client';

function maskConnectionString(value: string): string {
  return value.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
}

function hasPlaceholder(value: string): boolean {
  return value.includes('YOUR_DB_PASSWORD') || value.includes('YOUR_PROJECT_REF');
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  const directUrl = process.env.DIRECT_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL est manquante dans .env');
  }

  if (!directUrl) {
    throw new Error('DIRECT_URL est manquante dans .env');
  }

  if (hasPlaceholder(databaseUrl) || hasPlaceholder(directUrl)) {
    throw new Error('Remplace les placeholders YOUR_DB_PASSWORD / YOUR_PROJECT_REF dans .env avant de tester la connexion.');
  }

  console.log(`DATABASE_URL: ${maskConnectionString(databaseUrl)}`);
  console.log(`DIRECT_URL:   ${maskConnectionString(directUrl)}`);

  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('OK: Connexion Prisma -> Supabase valide.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ECHEC DB CHECK: ${message}`);
  process.exit(1);
});
