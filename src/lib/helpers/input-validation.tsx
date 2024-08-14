export const isNumericOrCommaSeparated = (input: string): boolean => {
  const regex = /^-?\d+(,\d+)?$/;
  return regex.test(input);
};

export const isValidTokenAmount = (input: string): boolean => {
  const floatRegex = /^(0|[1-9]\d*)?(\.\d*)?$/;
  if (!floatRegex.test(input)) {
    return false;
  }

  const decimalPart = input.split(".")[1];
  if (decimalPart && decimalPart.length > 6) {
    return false;
  }

  return true;
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
