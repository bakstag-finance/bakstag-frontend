export interface Offer {
  offerId: string;
  dstSellerAddress: string;
  dstEid: number;
  srcSellerAddress: string;
  srcTokenAddress: string;
  srcTokenTicker: string;
  srcTokenNetwork: string;
  dstTokenAddress: string;
  dstTokenTicker: string;
  dstTokenNetwork: string;
  srcAmountLD: bigint;
  exchangeRateSD: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIOrder {
  status: 200;
  objects: Offer[];
}
