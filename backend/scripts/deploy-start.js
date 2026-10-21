const { execSync } = require('child_process');

// Auto-sync database tables on startup if PostgreSQL DATABASE_URL is provided
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  try {
    console.log('🔄 Checking & synchronizing database schema with PostgreSQL...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ PostgreSQL schema synchronized successfully.');
  } catch (err) {
    console.warn('⚠️ Note: Database auto-sync skipped or deferred:', err.message);
  }
}

// Launch the compiled server
require('../dist/server.js');
