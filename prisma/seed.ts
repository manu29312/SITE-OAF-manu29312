import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const appUser = await prisma.user.upsert({
    where: { clerkId: 'seed-user-clerk-id' },
    update: {},
    create: {
      clerkId: 'seed-user-clerk-id',
      email: 'demo@site-oaf.local',
      name: 'Demo User',
      company: 'SITE OAF Demo',
    },
  });

  const existingClients = await prisma.client.count({ where: { userId: appUser.id } });
  if (existingClients > 0) {
    return;
  }

  const c1 = await prisma.client.create({
    data: {
      userId: appUser.id,
      name: 'Emma Renaud',
      email: 'emma.renaud@atelier-oaf.fr',
      company: 'Atelier OAF',
      status: 'ACTIF',
      city: 'Lyon',
    },
  });

  const c2 = await prisma.client.create({
    data: {
      userId: appUser.id,
      name: 'Paul Martin',
      email: 'paul.martin@studio-mk.fr',
      company: 'Studio MK',
      status: 'ACTIF',
      city: 'Nantes',
    },
  });

  const c3 = await prisma.client.create({
    data: {
      userId: appUser.id,
      name: 'Chloe Garnier',
      email: 'chloe.garnier@northline.fr',
      company: 'Northline',
      status: 'INACTIF',
      city: 'Lille',
    },
  });

  await prisma.invoice.createMany({
    data: [
      {
        userId: appUser.id,
        clientId: c1.id,
        number: 'FAC-2026-0001',
        issueDate: new Date('2026-04-01'),
        dueDate: new Date('2026-04-18'),
        amountHt: 1200,
        taxRate: 20,
        amountTax: 240,
        amountTtc: 1440,
        status: 'ENVOYEE',
      },
      {
        userId: appUser.id,
        clientId: c2.id,
        number: 'FAC-2026-0002',
        issueDate: new Date('2026-04-02'),
        dueDate: new Date('2026-04-14'),
        amountHt: 850,
        taxRate: 20,
        amountTax: 170,
        amountTtc: 1020,
        status: 'BROUILLON',
      },
      {
        userId: appUser.id,
        clientId: c3.id,
        number: 'FAC-2026-0003',
        issueDate: new Date('2026-03-15'),
        dueDate: new Date('2026-04-01'),
        amountHt: 2200,
        taxRate: 20,
        amountTax: 440,
        amountTtc: 2640,
        status: 'RETARD',
      },
    ],
  });

  await prisma.contract.createMany({
    data: [
      {
        userId: appUser.id,
        clientId: c1.id,
        title: 'Maintenance trimestrielle',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        amount: 4800,
        status: 'ACTIF',
      },
      {
        userId: appUser.id,
        clientId: c2.id,
        title: 'Refonte interface B2B',
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-06-30'),
        amount: 12500,
        status: 'A_RENOUVELER',
      },
      {
        userId: appUser.id,
        clientId: c3.id,
        title: 'Support annuel',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        amount: 3200,
        status: 'EXPIRE',
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
