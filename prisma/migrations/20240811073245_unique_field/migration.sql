/*
  Warnings:

  - A unique constraint covering the columns `[offerId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_offerId_key" ON "Order"("offerId");
