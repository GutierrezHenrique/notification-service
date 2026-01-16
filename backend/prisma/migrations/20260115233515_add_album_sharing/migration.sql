-- AlterTable
ALTER TABLE "albums" ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "albums_share_token_key" ON "albums"("share_token");
