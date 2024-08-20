import {
  BASE_SEPOLIA_SCAN,
  LAYER_ZERO_SCAN,
  OPTIMISM_SEPOLIA_SCAN,
} from "../constants";

export const getScanLink = ({
  isMonochain,
  srcNetwork,
  txHash,
}: {
  isMonochain: boolean;
  srcNetwork: string;
  txHash: string;
}): string => {
  let url = "";
  if (isMonochain) {
    switch (srcNetwork) {
      case "OP":
        url = OPTIMISM_SEPOLIA_SCAN;
        break;
      case "BASE":
        url = BASE_SEPOLIA_SCAN;
        break;
      default:
        url = BASE_SEPOLIA_SCAN;
        break;
    }
  } else {
    url = LAYER_ZERO_SCAN;
  }

  return url + txHash;
};
