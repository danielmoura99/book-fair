-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "cashRegisterId" TEXT;

-- CreateTable
CREATE TABLE "CashRegister" (
    "id" TEXT NOT NULL,
    "openingDate" TIMESTAMP(3) NOT NULL,
    "closingDate" TIMESTAMP(3),
    "initialAmount" DECIMAL(10,2) NOT NULL,
    "finalAmount" DECIMAL(10,2),
    "status" "CashRegisterStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CashRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashWithdrawal" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashWithdrawal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashWithdrawal" ADD CONSTRAINT "CashWithdrawal_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
