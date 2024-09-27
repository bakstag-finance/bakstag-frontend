import {
  ContractFunctionExecutionError,
  ContractFunctionExecutionErrorType,
  ContractFunctionRevertedError,
  decodeErrorResult,
} from "viem";
import { Abi } from "abitype";
import {
  SimulateContractErrorType,
  WriteContractErrorType,
  WaitForTransactionReceiptErrorType,
  ReadContractErrorType,
} from "@wagmi/core";
import { BaseError } from "wagmi";
import { splitCamelCase } from "@/lib/helpers/formating";

interface ParseEvmTransactionLogArgs<TAbi extends Abi | readonly unknown[]> {
  abi: TAbi;
  error:
    | ContractFunctionExecutionErrorType
    | SimulateContractErrorType
    | WriteContractErrorType
    | WaitForTransactionReceiptErrorType
    | ReadContractErrorType
    | null;
}

export const decodeEvmTransactionErrorResult = <
  TAbi extends Abi | readonly unknown[],
>({
  error,
  abi,
}: ParseEvmTransactionLogArgs<TAbi>) => {
  try {
    if (
      error instanceof BaseError ||
      error instanceof ContractFunctionExecutionError
    ) {
      const revertError = error.walk(
        (err) => err instanceof ContractFunctionRevertedError,
      );
      if (revertError instanceof ContractFunctionRevertedError) {
        const errorName = revertError.data?.errorName ?? "";

        if (errorName) {
          // This error is already decoded
          const decodedError = revertError.data;
          return { error, decodedError };
        }
      }
    }

    if (
      error?.cause instanceof ContractFunctionRevertedError &&
      error?.cause?.signature
    ) {
      const decodedError = decodeErrorResult({
        abi,
        data: error?.cause?.signature,
      });

      return { decodedError, error };
    }
    return { error, decodedError: undefined };
  } catch (_) {
    return { error, decodedError: undefined };
  }
};

export function handleContractError<T>(error: T, abi: Abi): string {
  const res = decodeEvmTransactionErrorResult({
    abi: abi,
    error: error as WriteContractErrorType | ReadContractErrorType | null,
  });

  console.log("Result", res);

  if (!res.decodedError) {
    if (
      (res.error as any)?.functionName === "createOffer" ||
      (res.error as any)?.functionName === "acceptOffer"
    ) {
      return splitCamelCase(res.error?.name || "");
    }

    return (res.error as any).shortMessage;
  }

  return splitCamelCase(res.decodedError?.errorName || "");
}
