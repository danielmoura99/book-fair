/*
  Warnings:

  - Added the required column `distributor` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "distributor" TEXT NOT NULL;
