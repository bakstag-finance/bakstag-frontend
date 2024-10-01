import { tokensData } from "./tokens";
import {
  LAYER_ZERO_SCAN,
  OPTIMISM_SEPOLIA_SCAN,
  BASE_SEPOLIA_SCAN,
} from "./scans";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_URL
    : process.env.NEXT_PUBLIC_DEV_URL;

export {
  tokensData,
  BASE_URL,
  LAYER_ZERO_SCAN,
  OPTIMISM_SEPOLIA_SCAN,
  BASE_SEPOLIA_SCAN,
};
