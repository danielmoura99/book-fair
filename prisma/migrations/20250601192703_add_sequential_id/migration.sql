/*
  Warnings:

  - A unique constraint covering the columns `[sequentialId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "sequentialId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_sequentialId_key" ON "Transaction"("sequentialId");
