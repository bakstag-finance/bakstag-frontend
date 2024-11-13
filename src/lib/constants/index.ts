import { tokensData } from "./tokens";
import {
  LAYER_ZERO_SCAN,
  OPTIMISM_SEPOLIA_SCAN,
  BASE_SEPOLIA_SCAN,
  SHASTA_TRON_SCAN,
} from "./scans";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_URL
    : process.env.NEXT_PUBLIC_DEV_URL;

const SHARED_SYSTEM_DECIMAL = 6;

export {
  tokensData,
  BASE_URL,
  LAYER_ZERO_SCAN,
  OPTIMISM_SEPOLIA_SCAN,
  BASE_SEPOLIA_SCAN,
  SHASTA_TRON_SCAN,
  SHARED_SYSTEM_DECIMAL,
};
