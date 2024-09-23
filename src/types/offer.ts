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
}
export interface OfferProps {
  srcToken: {
    ticker: string;
    network: string;
  };
  dstToken: {
    ticker: string;
    network: string;
  };
  dstSellerAddress: string;
  offerId: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmountLD: string;
  exchangeRateSD: string;
}

export interface APIOrder {
  status: 200;
  objects: Offer[];
}
