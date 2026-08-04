-- CreateEnum
CREATE TYPE "Fulfillment" AS ENUM ('AFFILIATE', 'OWN_STOCK', 'DROPSHIP');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "fulfillment" "Fulfillment" NOT NULL DEFAULT 'AFFILIATE',
                      ADD COLUMN "checkoutUrl" TEXT,
                      ADD COLUMN "deliveryMinDays" INTEGER,
                      ADD COLUMN "deliveryMaxDays" INTEGER,
                      ADD COLUMN "supplierCountry" TEXT;
