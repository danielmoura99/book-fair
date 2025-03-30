-- CreateTable
CREATE TABLE "InventoryBook" (
    "id" TEXT NOT NULL,
    "codFle" TEXT NOT NULL,
    "barCode" TEXT,
    "location" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "coverPrice" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "distributor" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryEntry" (
    "id" TEXT NOT NULL,
    "inventoryBookId" TEXT NOT NULL,
    "barcodeUsed" TEXT,
    "quantity" INTEGER NOT NULL,
    "batchName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "InventoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryBook_codFle_key" ON "InventoryBook"("codFle");

-- AddForeignKey
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_inventoryBookId_fkey" FOREIGN KEY ("inventoryBookId") REFERENCES "InventoryBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
