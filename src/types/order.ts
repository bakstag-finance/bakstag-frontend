export interface Order {
  offerId: string;
  dstSellerAddress: string;
  dstEid: number;
  srcTokenAddress: string;
  srcTokenTicker: string;
  srcTokenNetwork: string;
  dstTokenAddress: string;
  dstTokenTicker: string;
  dstTokenNetwork: string;
  srcAmountLD: bigint;
  exchangeRateSD: bigint;
}

export interface APIOrder {
  status: 200;
  objects: Order[];
}
