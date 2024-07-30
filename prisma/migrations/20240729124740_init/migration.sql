-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "offerId" TEXT NOT NULL,
    "dstSellerAddress" TEXT NOT NULL,
    "dstEid" INTEGER NOT NULL,
    "srcTokenAddress" TEXT NOT NULL,
    "dstTokenAddress" TEXT NOT NULL,
    "srcAmountLD" BIGINT NOT NULL,
    "exchangeRateSD" BIGINT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
