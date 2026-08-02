-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SOMMEIL', 'SECURITE', 'JEU', 'EVEIL', 'EXTERIEUR', 'DOUDOU', 'REPAS', 'TRANSPORT', 'AUTRE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('SPOTTED', 'TESTING', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SourcePlatform" AS ENUM ('TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'PINTEREST', 'YOUTUBE', 'AUTRE');

-- CreateEnum
CREATE TYPE "RawSourceStatus" AS ENUM ('PENDING', 'PROCESSED', 'DISCARDED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawSource" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" "SourcePlatform" NOT NULL DEFAULT 'AUTRE',
    "caption" TEXT,
    "observedViews" INTEGER,
    "observedLikes" INTEGER,
    "observedComments" INTEGER,
    "observedShares" INTEGER,
    "notes" TEXT,
    "status" "RawSourceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "RawSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL DEFAULT 'AUTRE',
    "description" TEXT,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "sourcePlatform" "SourcePlatform",
    "rawSourceId" TEXT,
    "supplierName" TEXT,
    "supplierUrl" TEXT,
    "estimatedPriceCents" INTEGER,
    "estimatedCostCents" INTEGER,
    "estimatedMarginPct" DOUBLE PRECISION,
    "affiliateUrl" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'SPOTTED',
    "viralScore" INTEGER,
    "viralScoreRationale" TEXT,
    "rating" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMetricSnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "engagementRate" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "source" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_rawSourceId_key" ON "Product"("rawSourceId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "ProductMetricSnapshot_productId_capturedAt_idx" ON "ProductMetricSnapshot"("productId", "capturedAt");

-- CreateIndex
CREATE INDEX "Click_productId_createdAt_idx" ON "Click"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_rawSourceId_fkey" FOREIGN KEY ("rawSourceId") REFERENCES "RawSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMetricSnapshot" ADD CONSTRAINT "ProductMetricSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
