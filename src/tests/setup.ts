import * as dotenv from 'dotenv';
import * as process from 'process';
import { beforeEach, afterEach, TestContext } from 'vitest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.test', override: true });
const prisma = new PrismaClient();

beforeEach(async (context: TestContext) => {
  if (isE2ETest(context)) {
    execSync('npx prisma migrate deploy');
  }
});

afterEach(async (context: TestContext) => {
  if (isE2ETest(context)) {
    await prisma.$executeRawUnsafe('DROP DATABASE ' + getDatabaseName());
    await prisma.$disconnect();
  }
});

function isE2ETest(context: TestContext) {
  const fileName = context.task.file?.name;
  return fileName?.includes('/e2e');
}

function getDatabaseName() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl?.substring(databaseUrl?.lastIndexOf('/') + 1) ?? '';
}
