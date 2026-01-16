-- Script SQL para aplicar manualmente as mudanças do Google OAuth
-- Execute este script diretamente no banco de dados PostgreSQL

-- Tornar password opcional (nullable) - apenas se ainda não for nullable
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
    END IF;
END $$;

-- Adicionar campo provider
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" VARCHAR;

-- Adicionar campo google_id (único)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" VARCHAR;

-- Criar índice único para google_id (apenas se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' 
        AND indexname = 'users_google_id_key'
    ) THEN
        CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
    END IF;
END $$;

-- Adicionar campo profile_picture
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_picture" VARCHAR;
