export type ApprovingStatus = "idle" | "pending" | "error" | "success";

export interface LzFee {
  nativeFee: bigint;
  lzTokenFee: bigint;
}
