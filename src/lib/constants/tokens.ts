export type TokenIdentity = {
  token: string;
  network: string;
};

export const tokensIdentity: Record<string, TokenIdentity> = {
  "eth-opt": {
    token: "ETH",
    network: "OP",
  },
  "op-opt": {
    token: "OPT",
    network: "OP",
  },
  "usdc-opt": {
    token: "USDC",
    network: "OP",
  },
  "usdt-opt": {
    token: "USDT",
    network: "OP",
  },
  "sol-sol": {
    token: "SOL",
    network: "SOL",
  },
  "usdc-sol": {
    token: "USDC",
    network: "SOL",
  },
  "usdt-sol": {
    token: "USDT",
    network: "SOL",
  },
  "eth-base": {
    token: "ETH",
    network: "BASE",
  },
  "usdc-base": {
    token: "USDC",
    network: "BASE",
  },
} as const;
