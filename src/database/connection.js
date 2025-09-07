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

// Test connection on startup (only in development and not on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  prisma.$connect()
    .then(async () => {
      console.log('✅ Database connected successfully');
      // Test query to ensure schema is accessible
      try {
        await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query test successful');
      } catch (queryError) {
        console.error('❌ Database query test failed:', queryError.message);
        // Don't exit, just warn
        console.warn('⚠️ Database schema may need initialization');
      }
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message);
      // Don't exit in development to allow for setup
      if (process.env.NODE_ENV !== 'development') {
        process.exit(1);
      }
    });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('📴 Database disconnected');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('📴 Database disconnected on SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('📴 Database disconnected on SIGTERM');
  process.exit(0);
});

export default prisma;