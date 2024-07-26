import { otcMarketConfig } from "../wagmi/contracts/abi";

export type TokenData = {
  token: string;
  network: string;
  chainId: 1 | 11155111 | 84532 | 4002 | 11155420 | 421614 | undefined;
  tokenAddress: `0x${string}`;
  eid: string;
  otcConfig: typeof otcMarketConfig;
  decimals: number;
};

/**
 * Optimism 
 * sepolia chain id - 11155420
 * main chain id - 10
 * 
 * Base 
 * sepolia chain id - 84532
 * main chain id -  8453
 */
export const tokensData: Record<string, TokenData> = {
  "eth-opt": {
    token: "ETH",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    otcConfig: otcMarketConfig,
    decimals: 18
  },
  "op-opt": {
    token: "OPT",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x8B3bcfa4680e8a16215e587DfCcD1730A453CeaD",
    otcConfig: otcMarketConfig,
    decimals: 18 // TODO: replace to 6
  },
  "usdc-opt": {
    token: "USDC",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x8B3bcfa4680e8a16215e587DfCcD1730A453CeaD",
    otcConfig: otcMarketConfig,
    decimals: 18 // TODO: replace to 6
  },
  "usdt-opt": {
    token: "USDT",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x8B3bcfa4680e8a16215e587DfCcD1730A453CeaD",
    otcConfig: otcMarketConfig,
    decimals: 18 // TODO: replace to 6 
      },
  // "sol-sol": {
  //   token: "SOL",
  //   network: "SOL",
  // },
  // "usdc-sol": {
  //   token: "USDC",
  //   network: "SOL",
  // },
  // "usdt-sol": {
  //   token: "USDT",
  //   network: "SOL",
  // },
  "eth-base": {
    token: "ETH",
    network: "BASE",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    eid: "40232",
    chainId: 84532,
    otcConfig: otcMarketConfig,
    decimals: 18
  },
  "usdc-base": {
    token: "USDC",
    network: "BASE",
    tokenAddress: "0x21bFF5Cd1f61b59Cc2D908C050735b87cb780d2d",
    eid: "40232",
    chainId: 84532,
    otcConfig: otcMarketConfig,
    decimals: 18 // TODO: replace to 6
  },
} as const
