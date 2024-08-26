export const addressFormat = (str: string): string => {
  if (!str || str.length <= 8) {
    return str;
  }

  const start = str.slice(0, 4);
  const end = str.slice(-4);

  return `${start}...${end}`;
};

export const calculateSrcAmountPerOneDst = (
  srcAmount: string,
  dstAmount: string,
) => {
  return Number(srcAmount) / Number(dstAmount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num
    .toFixed(decimals)
    .replace(/\.?0+$/, "")
    .toLocaleString();
};
