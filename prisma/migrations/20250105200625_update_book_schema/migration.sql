/*
  Warnings:

  - You are about to drop the column `price` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codFle]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codFle` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverPrice` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medium` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "price",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "barCode" TEXT,
ADD COLUMN     "codFle" TEXT NOT NULL,
ADD COLUMN     "coverPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "medium" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "date",
ADD COLUMN     "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Book_codFle_key" ON "Book"("codFle");
