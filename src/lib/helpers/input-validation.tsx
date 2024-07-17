export const isNumberOrCommaNumber = (input: string):boolean => {
    const regex = /^-?\d+(,\d+)?$/;
    return regex.test(input);
  }
