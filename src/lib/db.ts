import { PrismaClient } from '@prisma/client'

// Use a versioned key to force new client when schema changes
const PRISMA_GLOBAL_KEY = 'prismaClient_v2'

const globalForPrisma = globalThis as unknown as Record<string, PrismaClient | undefined>

export const db =
  globalForPrisma[PRISMA_GLOBAL_KEY] ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma[PRISMA_GLOBAL_KEY] = db