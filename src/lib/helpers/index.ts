import {
  addressFormat,
  calculateSrcAmountPerOneDst,
  splitCamelCase,
} from "./formating";
import {
  isEthAddress,
  isSolanaAddress,
  isValidCryptoAddress,
} from "./address-validation";
import {
  isNumericOrCommaSeparated,
  isValidTokenAmount,
  isValueOutOfBounds,
  validateTokenAmount,
} from "./input-validation";
import {
  addressToBytes32,
  hexZeroPadTo32,
  hexZeroPadTo20,
  toSD,
  hexStripsAddr,
} from "./string-converter";
import { getTokenField } from "./token-info";
import { getScanLink } from "./get-scan-link";

import { calculateTotalReceiveAmount } from "./calculation";

import {
  decodeEvmTransactionErrorResult,
  handleContractError,
} from "./decode-error";

export {
  toSD,
  addressFormat,
  isEthAddress,
  isSolanaAddress,
  addressToBytes32,
  hexZeroPadTo32,
  hexZeroPadTo20,
  isValidCryptoAddress,
  isValidTokenAmount,
  isValueOutOfBounds,
  isNumericOrCommaSeparated,
  getTokenField,
  hexStripsAddr,
  getScanLink,
  calculateSrcAmountPerOneDst,
  calculateTotalReceiveAmount,
  validateTokenAmount,
  splitCamelCase,
  handleContractError,
  decodeEvmTransactionErrorResult,
};
