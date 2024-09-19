export const isNumericOrCommaSeparated = (input: string): boolean => {
  const regex = /^-?\d+(,\d+)?$/;
  return regex.test(input);
};

export const isValidTokenAmount = (input: string): boolean => {
  if (input.length <= 0) {
    return false;
  }
  const floatRegex = /^(0|[1-9]\d*)?(\.\d*)?$/;
  return floatRegex.test(input);
};

export const isValueOutOfBounds = (
  value: string,
  min: number = 0.000001,
  max: number = 2 ** 64 - 1,
): boolean => {
  const parsedValue = Number(value);
  if (typeof parsedValue !== "number") {
    return false;
  }

  return parsedValue < min || parsedValue > max;
};

export const validateTokenAmount = (amount: string) =>
  isValidTokenAmount(amount) && !isValueOutOfBounds(amount);
