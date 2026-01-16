const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Aplicando migration para adicionar campos do Google OAuth...');
    
    // Tornar password opcional
    await prisma.$executeRaw`
      ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
    `;
    console.log('✓ Password agora é opcional');
    
    // Adicionar campo provider
    await prisma.$executeRaw`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" VARCHAR;
    `;
    console.log('✓ Campo provider adicionado');
    
    // Adicionar campo google_id
    await prisma.$executeRaw`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" VARCHAR;
    `;
    console.log('✓ Campo google_id adicionado');
    
    // Criar índice único para google_id
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");
    `;
    console.log('✓ Índice único para google_id criado');
    
    // Adicionar campo profile_picture
    await prisma.$executeRaw`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_picture" VARCHAR;
    `;
    console.log('✓ Campo profile_picture adicionado');
    
    console.log('\n✅ Migration aplicada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    if (error.code === 'P2010') {
      console.log('Nota: Algumas colunas podem já existir. Isso é normal.');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
