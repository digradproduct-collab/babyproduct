-- CreateEnum
CREATE TYPE "AffiliateNetwork" AS ENUM ('AWIN', 'EFFILIATION', 'RAKUTEN', 'TRADEDOUBLER', 'AUTRE');

-- CreateEnum
CREATE TYPE "FeedFormat" AS ENUM ('CSV', 'XML', 'JSON');

-- CreateTable
CREATE TABLE "ProductFeed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "network" "AffiliateNetwork" NOT NULL,
    "format" "FeedFormat" NOT NULL,
    "url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "mapping" JSONB,
    "itemsPath" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncOk" BOOLEAN,
    "lastSyncMessage" TEXT,
    "lastItemCount" INTEGER,
    "lastMatchedCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFeed_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "priceUpdatedAt" TIMESTAMP(3),
                      ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EUR',
                      ADD COLUMN "inStock" BOOLEAN,
                      ADD COLUMN "feedId" TEXT,
                      ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE INDEX "Product_feedId_externalId_idx" ON "Product"("feedId", "externalId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "ProductFeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
