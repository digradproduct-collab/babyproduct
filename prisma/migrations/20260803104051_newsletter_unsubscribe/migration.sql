-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "unsubscribeToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");
