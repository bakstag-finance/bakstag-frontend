export const calculateTotalReceiveAmount = (
  srcTokenAmount: string,
  exchangeRate: string,
) => {
  return Number(srcTokenAmount) * Number(exchangeRate) * 0.99;
};
