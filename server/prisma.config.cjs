const { defineConfig } = require('prisma/config')
const path = require('node:path')

// Ensure .env is loaded so DATABASE_URL is available to schema.prisma
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile()
}

module.exports = defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'node -r ts-node/register prisma/seed.ts'
  }
})
