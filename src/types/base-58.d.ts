declare module "base-58" {
  const base58: {
    encode: (input: Buffer | string) => string;
    decode: (input: string) => Buffer;
  };
  export default base58;
}
