-- CreateTable
CREATE TABLE "WaitingNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitingNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitingNotification_listingId_idx" ON "WaitingNotification"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitingNotification_userId_listingId_key" ON "WaitingNotification"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "WaitingNotification" ADD CONSTRAINT "WaitingNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingNotification" ADD CONSTRAINT "WaitingNotification_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
