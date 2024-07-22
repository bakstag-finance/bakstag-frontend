export const isNumericOrCommaSeparated = (input: string): boolean => {
  const regex = /^-?\d+(,\d+)?$/;
  return regex.test(input);
};
