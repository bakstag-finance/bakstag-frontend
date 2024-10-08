import { tronWeb } from "../tron";

export const isEthAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const solanaAddressRegex = /^([1-9A-HJ-NP-Za-km-z]{32,44})$/;

export const isSolanaAddress = (address: string): boolean => {
  return solanaAddressRegex.test(address);
};

export const isValidCryptoAddress = (
  address: string,
  network: string,
): boolean => {
  if (network === "TRON") {
    return tronWeb.isAddress(address);
  }

  return isEthAddress(address) || isSolanaAddress(address);
};
