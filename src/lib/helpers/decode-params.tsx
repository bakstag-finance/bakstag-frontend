import base58 from "base-58";

export const encodeParams = (value: string) => {
  return base58.encode(Buffer.from(value));
};
export const decodeParams = (encodedValue: string) => {
  const decodedBuffer = base58.decode(encodedValue);
  return decodedBuffer.toString();
};
