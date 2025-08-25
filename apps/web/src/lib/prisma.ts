import { PrismaClient } from '@prisma/client'

// Prisma Client singleton to avoid creating multiple instances in dev with HMR
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimizaciones para MySQL en producción
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configuración de conexiones para MySQL
    ...(process.env.NODE_ENV === 'production' && {
      // En producción, usar pool de conexiones optimizado
      datasourceUrl: process.env.DATABASE_URL,
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Función helper para transacciones optimizadas
export async function withTransaction<T>(
  fn: (tx: any) => Promise<T>,
  options?: {
    maxWait?: number
    timeout?: number
  }
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: options?.maxWait || 5000, // 5 segundos max wait
    timeout: options?.timeout || 10000, // 10 segundos timeout
  })
}

// Función helper para debugging de conexiones
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, message: 'Database connection successful' }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { connected: false, message: 'Database connection failed', error }
  }
}
