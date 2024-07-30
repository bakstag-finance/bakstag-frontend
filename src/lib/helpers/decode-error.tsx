import { decodeErrorResult, isHex } from "viem";
import { otcMarketAbi } from "@/lib/wagmi/contracts/abi";

const abis = [otcMarketAbi];

const getContractErrorHashFromError = (error: any): string | undefined => {
  if (error?.version && /viem/.test(error.version)) {
    const code = error?.code;

    if (!isHex(code) && error?.cause) {
      return getContractErrorHashFromError(error.cause);
    }

    return code;
  }
};

export default function getContractErrorInfo(error: any) {
  const hex = getContractErrorHashFromError(error);

  if (!isHex(hex)) {
    return {
      hex: null,
      name: "Something Went Wrong",
    };
  }

  let foundErrorName: any = null;

  abis.some((abi) => {
    try {
      const { errorName } = decodeErrorResult({
        abi,
        data: hex,
      });

      foundErrorName = errorName;
    } catch {}

    return foundErrorName;
  });

  return {
    hex,
    name: foundErrorName,
  };
}
