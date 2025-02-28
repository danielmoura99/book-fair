/*
  Warnings:

  - Added the required column `operatorName` to the `CashWithdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CashWithdrawal" ADD COLUMN     "operatorName" TEXT NOT NULL;
