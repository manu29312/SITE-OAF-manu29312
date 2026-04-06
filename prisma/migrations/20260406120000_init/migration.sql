-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIF', 'INACTIF');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('BROUILLON', 'ENVOYEE', 'PAYEE', 'RETARD');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIF', 'A_RENOUVELER', 'EXPIRE');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "clerkId" TEXT NOT NULL,
  "email" TEXT,
  "name" TEXT,
  "company" TEXT,
  "vatNumber" TEXT,
  "siren" TEXT,
  "address" TEXT,
  "iban" TEXT,
  "logoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "city" TEXT,
  "vatNumber" TEXT,
  "status" "ClientStatus" NOT NULL DEFAULT 'ACTIF',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "amountHt" DECIMAL(12,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL,
  "amountTax" DECIMAL(12,2) NOT NULL,
  "amountTtc" DECIMAL(12,2) NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'BROUILLON',
  "pdfUrl" TEXT,
  "sentAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "contractType" TEXT,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "country" TEXT,
  "language" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "status" "ContractStatus" NOT NULL DEFAULT 'ACTIF',
  "signatureStatus" TEXT,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "scheduleDate" TIMESTAMP(3) NOT NULL,
  "status" "ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
  "channel" "ReminderChannel" NOT NULL DEFAULT 'EMAIL',
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "eventType" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_number_key" ON "Invoice"("userId", "number");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");

-- CreateIndex
CREATE INDEX "Contract_clientId_idx" ON "Contract"("clientId");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");

-- CreateIndex
CREATE INDEX "Reminder_invoiceId_idx" ON "Reminder"("invoiceId");

-- CreateIndex
CREATE INDEX "EventLog_userId_idx" ON "EventLog"("userId");

-- CreateIndex
CREATE INDEX "EventLog_entityType_entityId_idx" ON "EventLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
