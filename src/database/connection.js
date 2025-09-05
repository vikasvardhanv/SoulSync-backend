import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in serverless
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal',
  datasources: {
    db: {
      url: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// Ensure single instance in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test connection on startup (only in development)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;