import { PrismaClient } from '@prisma/client';

/**
 * Instantiate and export a single global Prisma Client instance
 * to avoid spawning too many database connections in development.
 */
const prisma = new PrismaClient();

export default prisma;
