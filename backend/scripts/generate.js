const { execSync } = require('child_process');

// Ensure DATABASE_URL is valid for Prisma CLI schema validation during offline build
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/eveplanner?schema=public';
}

console.log('Generating Prisma Client (safe offline build)...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
