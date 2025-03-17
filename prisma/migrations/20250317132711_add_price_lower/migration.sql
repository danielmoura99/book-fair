/*
  Warnings:

  - You are about to drop the column `Price` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "Price",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL DEFAULT 0;
