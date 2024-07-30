/*
  Warnings:

  - Added the required column `dstTokenNetwork` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dstTokenTicker` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcTokenNetwork` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcTokenTicker` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dstTokenNetwork" TEXT NOT NULL,
ADD COLUMN     "dstTokenTicker" TEXT NOT NULL,
ADD COLUMN     "srcTokenNetwork" TEXT NOT NULL,
ADD COLUMN     "srcTokenTicker" TEXT NOT NULL;
