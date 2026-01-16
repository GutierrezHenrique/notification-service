-- Migration manual para adicionar campos de Google OAuth
-- Execute este SQL no banco de dados se a migration automática não funcionar

-- Tornar password opcional (nullable)
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- Adicionar campo provider
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" VARCHAR;

-- Adicionar campo google_id (único)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" VARCHAR;
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");

-- Adicionar campo profile_picture
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_picture" VARCHAR;
