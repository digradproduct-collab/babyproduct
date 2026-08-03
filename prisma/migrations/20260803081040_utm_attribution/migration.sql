/*
  Warnings:

  - You are about to drop the column `source` on the `Click` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `PageView` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Click" DROP COLUMN "source",
ADD COLUMN     "context" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- AlterTable
ALTER TABLE "PageView" DROP COLUMN "source",
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- CreateIndex
CREATE INDEX "Click_utmSource_createdAt_idx" ON "Click"("utmSource", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_productId_createdAt_idx" ON "PageView"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_utmSource_createdAt_idx" ON "PageView"("utmSource", "createdAt");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
