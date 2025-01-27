-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'EXCHANGE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "priceDifference" DECIMAL(10,2),
ADD COLUMN     "returnedBookId" TEXT,
ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'SALE';
