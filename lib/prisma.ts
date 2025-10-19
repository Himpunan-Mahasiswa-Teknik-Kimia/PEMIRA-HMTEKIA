import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Debug: log which database host we're connecting to (no credentials)
if (process.env.NODE_ENV !== 'production') {
  try {
    const url = process.env.DATABASE_URL
    if (url) {
      const u = new URL(url)
      // Example output: [Prisma] Connecting to postgresql://localhost:5432/PEMIRA-ITERA
      console.log(`[Prisma] Connecting to ${u.protocol}//${u.host}${u.pathname}`)
    } else {
      console.warn('[Prisma] DATABASE_URL is not set')
    }
  } catch (e) {
    console.warn('[Prisma] Failed to parse DATABASE_URL')
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma