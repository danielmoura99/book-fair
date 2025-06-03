-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "saleGroupId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_sequentialId_idx" ON "Transaction"("sequentialId");

-- CreateIndex
CREATE INDEX "Transaction_saleGroupId_idx" ON "Transaction"("saleGroupId");
