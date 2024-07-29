import { ethers, utils } from "ethers";
import { isSolanaAddress } from "./address-validation";

export function hexZeroPadTo32(addr: `0x${string}`): `0x${string}` {
  return ethers.utils.hexZeroPad(addr, 32) as `0x${string}`;
}

export function hexZeroPadTo20(addr: `0x${string}`): `0x${string}` {
  return ethers.utils.hexZeroPad(addr, 40) as `0x${string}`;
}

export function trim0x(str: string): string {
  return str.replace(/^0x/, "");
}

/**
 * Convert address to bytes32
 * @param address 0x prefixed address(20bytes or 32bytes) or solana address
 */
export function addressToBytes32(address: `0x${string}`): Uint8Array {
  if (isSolanaAddress(address)) {
    return utils.base58.decode(address);
  } else if (address.startsWith("0x") && address.length <= 66) {
    return utils.arrayify(hexZeroPadTo32(address));
  }
  throw new Error("Invalid address");
}
