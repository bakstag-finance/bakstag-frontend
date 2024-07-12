export const isEthAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isSolanaAddress = (address: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{44}$/.test(address);
};

export const isValidCryptoAddress = (address: string): boolean => {
  return isEthAddress(address) || isSolanaAddress(address);
};
