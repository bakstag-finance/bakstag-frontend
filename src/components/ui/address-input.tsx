import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { isValidCryptoAddress } from "@/lib/helpers";

interface Props {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

export const AddressInput = ({ value, setValue }: Props) => {
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChanged(true);
    setValue(e.target.value);
  };

  const isValid = isValidCryptoAddress(value);

  return (
    <Input
      className={cn(
        "mt-2 bg-black border rounded-lg",
        isChanged
          ? isValid
            ? "border-gray-800"
            : "border-red-200 focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1"
          : "border-gray-800",
      )}
      value={value}
      onChange={handleChange}
      required
    />
  );
};
