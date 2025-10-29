import { ChainIds } from "@/types/contracts";
import { otcMarketConfig } from "../wagmi/contracts/abi";

export type TokenData = {
  token: string;
  network: string;
  chainId: ChainIds | undefined;
  tokenAddress: `0x${string}`;
  eid: string;
  otcConfig: typeof otcMarketConfig;
  decimals: number;
};

export const tokensData: Record<string, TokenData> = {
  // Optimism
  "eth-opt": {
    token: "ETH",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    otcConfig: otcMarketConfig,
    decimals: 18,
  },
  "usdt-opt": {
    token: "USDT",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // mainnet
    otcConfig: otcMarketConfig,
    decimals: 6,
  },
  "wbtc-opt": {
    token: "WBTC",
    network: "OP",
    chainId: 11155420,
    eid: "40232",
    tokenAddress: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", // Mainnet
    otcConfig: otcMarketConfig,
    decimals: 8,
  },

  // Base
  "eth-base": {
    token: "ETH",
    network: "BASE",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    eid: "40245",
    chainId: 84532,
    otcConfig: otcMarketConfig,
    decimals: 18,
  },
  "usdt-base": {
    token: "USDT",
    network: "BASE",
    tokenAddress: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    eid: "40245",
    chainId: 84532,
    otcConfig: otcMarketConfig,
    decimals: 6,
  },
  "wbtc-base": {
    token: "WBTC",
    network: "BASE",
    tokenAddress: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
    eid: "40245",
    chainId: 84532,
    otcConfig: otcMarketConfig,
    decimals: 8,
  },

  // Tron
  "trx-tron": {
    token: "TRX",
    network: "TRON",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    eid: "40420",
    chainId: undefined,
    otcConfig: otcMarketConfig,
    decimals: 6,
  },
  "usdt-tron": {
    token: "USDT",
    network: "TRON",
    tokenAddress: "0x42a1e39aefA49290F2B3F9ed688D7cecf86CD6E0",
    eid: "40420",
    chainId: undefined,
    otcConfig: otcMarketConfig,
    decimals: 6,
  },
  "wbtc-tron": {
    token: "WBTC",
    network: "TRON",
    tokenAddress: "0x84716914C0fDf7110A44030d04D0C4923504D9CC",
    eid: "40420",
    chainId: undefined,
    otcConfig: otcMarketConfig,
    decimals: 8,
  },
} as const;
