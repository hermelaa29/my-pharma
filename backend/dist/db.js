"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
/**
 * Instantiate and export a single global Prisma Client instance
 * to avoid spawning too many database connections in development.
 */
const prisma = new client_1.PrismaClient();
exports.default = prisma;
