/*
  Warnings:

  - You are about to drop the `InventoryEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InventoryLogType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- DropTable
DROP TABLE "InventoryEntry";

-- CreateTable
CREATE TABLE "InventoryLog" (
    "id" TEXT NOT NULL,
    "type" "InventoryLogType" NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookCodFle" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "operatorName" TEXT,
    "previousData" JSONB,
    "newData" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);
