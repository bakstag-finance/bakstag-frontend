export const addressFormat = (str: string): string => {
  if (!str || str.length <= 8) {
    return str;
  }

  const start = str.slice(0, 4);
  const end = str.slice(-4);

  return `${start}...${end}`;
};
