/*
  Warnings:

  - You are about to drop the column `batchName` on the `InventoryBook` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InventoryEntry" DROP CONSTRAINT "InventoryEntry_inventoryBookId_fkey";

-- AlterTable
ALTER TABLE "InventoryBook" DROP COLUMN "batchName";
