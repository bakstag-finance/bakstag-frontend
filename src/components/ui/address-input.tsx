import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { isValidCryptoAddress } from "@/lib/helpers";
import { Squircle } from "@squircle-js/react";

interface Props {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

export const AddressInput = ({ value, setValue, label }: Props) => {
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChanged(true);
    setValue(e.target.value);
  };

  const isValid = isValidCryptoAddress(value);

  return (
    <div className="w-full flex flex-col mt-5">
      <span className="text-xs text-gray-700 ml-3">{label}</span>
      <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
        <Input
          className={cn(
            "mt-2 bg-black border rounded-lg border-gray-800",
            isChanged
              ? isValid
                ? "text-white"
                : "text-red-200"
              : "text-white",
          )}
          value={value}
          onChange={handleChange}
          required
        />
      </Squircle>
    </div>
  );
};
