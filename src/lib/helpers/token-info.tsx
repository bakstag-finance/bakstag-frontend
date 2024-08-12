import { TokenData, tokensData } from "../constants/tokens";

type TokenDataField = keyof TokenData;

export const  getTokenField = <K extends TokenDataField>(
    ticker: string,
    network: string,
    field: K
  ): TokenData[K] => {
  const tokenEntry = Object.entries(tokensData).find(
    ([, tokenData]) => tokenData.token === ticker && tokenData.network === network
  );

  if (!tokenEntry) {
    throw new Error(`Token with ticker ${ticker} on network ${network} not found`);
  }

  const tokenData = tokenEntry[1];

  if (!(field in tokenData)) {
    throw new Error(`Field ${field} not found in token data for ticker ${ticker} on network ${network}`);
  }

  return tokenData[field]
}
