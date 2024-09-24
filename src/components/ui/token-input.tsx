import {
  ChangeEvent,
  Dispatch,
  InputHTMLAttributes,
  SetStateAction,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { validateTokenAmount } from "@/lib/helpers";
import { Squircle } from "@squircle-js/react";
import { Button } from "@/components/ui/button";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

export const TokenInput = ({ value, setValue, className, ...props }: Props) => {
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChanged(true);
    setValue(e.target.value);
  };

  const isValid = validateTokenAmount(value);

  return (
    <Squircle
      asChild
      cornerRadius={12}
      cornerSmoothing={1}
      className="bg-black text-white border border-gray-800"
    >
      <Input
        className={cn(
          "mt-2 bg-black border rounded-lg",
          className,
          isChanged
            ? isValid
              ? "border-gray-800"
              : "border-red-200 focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1"
            : "border-gray-800",
        )}
        placeholder={"0"}
        value={value}
        onChange={handleChange}
        required
        {...props}
      />
    </Squircle>
  );
};
