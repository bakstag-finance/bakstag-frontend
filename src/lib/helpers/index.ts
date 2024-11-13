import {
  addressFormat,
  calculateSrcAmountPerOneDst,
  splitCamelCase,
  formatNumberWithCommas,
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

import { encodeParams, decodeParams } from "./decode-params";

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
  formatNumberWithCommas,
  decodeEvmTransactionErrorResult,
  encodeParams,
  decodeParams
};
