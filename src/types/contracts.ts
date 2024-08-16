import { wagmiConfig } from "@/lib/wagmi/config";
export type Status = "idle" | "pending" | "error" | "success";

export interface LzFee {
  nativeFee: bigint;
  lzTokenFee: bigint;
}

const chains = wagmiConfig.chains.map((item) => item.id);

export type ChainIds = (typeof chains)[number] | undefined;
