-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" VARCHAR,
ADD COLUMN IF NOT EXISTS "google_id" VARCHAR,
ADD COLUMN IF NOT EXISTS "profile_picture" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");
