import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

// Next.js can load server code through more than one bundle in the same runtime.
// Keep one client per runtime in every environment so those bundles do not create
// competing Prisma pools against the same serverless database connection.
globalForPrisma.prisma = db;
