import app from './app';
import { env } from './config/env';
import prisma from './config/db';

const server = app.listen(env.PORT, async () => {
  console.log(`=========================================`);
  console.log(`✨ Eve Planner Backend API Server Online`);
  console.log(`🚀 Port: ${env.PORT}`);
  console.log(`🌐 Mode: ${env.NODE_ENV}`);
  console.log(`🔗 Database: ${env.DATABASE_URL.includes('file:') ? 'SQLite (dev)' : 'PostgreSQL'}`);
  console.log(`🤖 Gemini AI: ${env.GEMINI_API_KEY ? 'Configured (' + env.GEMINI_MODEL + ')' : 'Fallback mode active'}`);
  console.log(`=========================================`);

  try {
    const pkgCount = await prisma.eventPackage.count();
    if (pkgCount === 0) {
      console.log('🌱 No packages detected in database. Auto-seeding catalog...');
      const { seedDatabase } = await import('./services/seedService');
      await seedDatabase();
    } else {
      console.log(`📦 Database loaded with ${pkgCount} active celebration packages.`);
    }
  } catch (err: any) {
    console.warn('⚠️ Auto-seed startup check notice:', err.message);
  }
});

const gracefulShutdown = async () => {
  console.log('\nShutting down Eve Planner API server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process exited.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
