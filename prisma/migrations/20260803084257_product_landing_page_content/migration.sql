-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "faq" JSONB,
ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "testimonials" JSONB;
