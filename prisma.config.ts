import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '.env.local', quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js'
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://permacool:permacool@localhost:5432/permacool'
  }
});
