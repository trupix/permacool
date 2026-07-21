-- One-time PostgreSQL migration for the customer portal.
-- Review and run against a backup before deploying the portal code.

DO $$ BEGIN CREATE TYPE "PlatformRole" AS ENUM ('customer', 'staff_support', 'staff_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MembershipRole" AS ENUM ('customer_admin', 'operator', 'viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DocumentCategory" AS ENUM ('manual', 'cutsheet', 'wiring', 'service', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "platformRole" "PlatformRole" NOT NULL DEFAULT 'customer',
  ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS "companyName" TEXT,
  ADD COLUMN IF NOT EXISTS "accessNote" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approvedById" TEXT;

ALTER TABLE "UserOrganization"
  ADD COLUMN IF NOT EXISTS "role" "MembershipRole" NOT NULL DEFAULT 'viewer',
  ADD COLUMN IF NOT EXISTS "allDevices" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "UserDeviceAccess" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  CONSTRAINT "UserDeviceAccess_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserDeviceAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserDeviceAccess_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserDeviceAccess_userId_deviceId_key" ON "UserDeviceAccess"("userId", "deviceId");
CREATE INDEX IF NOT EXISTS "UserDeviceAccess_deviceId_idx" ON "UserDeviceAccess"("deviceId");

CREATE TABLE IF NOT EXISTS "SupportTicket" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "siteId" TEXT,
  "deviceId" TEXT,
  "createdById" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SupportTicket_organizationId_createdAt_idx" ON "SupportTicket"("organizationId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "SupportTicket_deviceId_idx" ON "SupportTicket"("deviceId");

CREATE TABLE IF NOT EXISTS "PortalDocument" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" "DocumentCategory" NOT NULL,
  "url" TEXT NOT NULL,
  "organizationId" TEXT,
  "siteId" TEXT,
  "deviceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortalDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PortalDocument_organizationId_idx" ON "PortalDocument"("organizationId");
CREATE INDEX IF NOT EXISTS "PortalDocument_deviceId_idx" ON "PortalDocument"("deviceId");

CREATE TABLE IF NOT EXISTS "InvoiceReference" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "freshbooksInvoiceId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "issuedAt" TIMESTAMP(3) NOT NULL,
  "dueAt" TIMESTAMP(3),
  "hostedUrl" TEXT,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvoiceReference_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InvoiceReference_freshbooksInvoiceId_key" ON "InvoiceReference"("freshbooksInvoiceId");
CREATE INDEX IF NOT EXISTS "InvoiceReference_organizationId_issuedAt_idx" ON "InvoiceReference"("organizationId", "issuedAt" DESC);

-- Promote the initial PermaCool operator accounts explicitly after review.
-- Example:
-- UPDATE "User" SET "platformRole" = 'staff_admin', "status" = 'approved' WHERE "email" = 'approved-admin@perma.cool';

