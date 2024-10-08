import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";
import { Squircle } from "@squircle-js/react";

interface Props {
  placeholder: string;
  className?: string;
  value: string;
  setValue(value: string): void;
}

export const SelectCoin = ({
  placeholder,
  className,
  value,
  setValue,
  ...props
}: Props) => {
  return (
    <Select value={value} onValueChange={setValue}>
      <Squircle
        asChild
        cornerRadius={12}
        cornerSmoothing={1}
        className="bg-black text-white border border-gray-800 rounded-xl"
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue
            placeholder={placeholder}
            className="border border-red"
          />
        </SelectTrigger>
      </Squircle>
      <SelectContent
        className={
          "bg-black text-white hover:border-gray-800 focus:border-gray-800 rounded-xl"
        }
      >
        <SelectGroup>
          <SelectLabel className="text-gray-700">Optimism Tokens</SelectLabel>
          <SelectItem value="eth-opt">
            ETH <span className="text-gray-700">(OP)</span>
          </SelectItem>
          <SelectItem value="op-opt">
            OP <span className="text-gray-700">(OP)</span>
          </SelectItem>
          <SelectItem value="usdc-opt">
            USDC <span className="text-gray-700">(OP)</span>
          </SelectItem>
          <SelectItem value="usdt-opt">
            USDT <span className="text-gray-700">(OP)</span>
          </SelectItem>
        </SelectGroup>
        {/* <SelectSeparator className={"bg-gray-800"} />
        <SelectGroup>
          <SelectLabel className={"text-gray-700"}>Solana Tokens</SelectLabel>
          <SelectItem value="sol-sol">
            SOL <span className="text-gray-700">(Solana)</span>
          </SelectItem>
          <SelectItem value="usdc-sol">
            USDC <span className="text-gray-700">(Solana)</span>
          </SelectItem>
          <SelectItem value="usdt-sol">
            USDT <span className="text-gray-700">(Solana)</span>
          </SelectItem>
        </SelectGroup> */}
        <SelectSeparator className={"bg-gray-800"} />
        <SelectGroup>
          <SelectLabel className="text-gray-700">Base Tokens</SelectLabel>
          <SelectItem value="eth-base">
            ETH <span className="text-gray-700">(Base)</span>
          </SelectItem>
          <SelectItem value="usdc-base">
            USDC <span className="text-gray-700">(Base)</span>
          </SelectItem>
        </SelectGroup>
        <SelectSeparator className={"bg-gray-800"} />
        <SelectGroup>
          <SelectLabel className="text-gray-700">Tron Tokens</SelectLabel>
          <SelectItem value="trx-tron">
            TRX <span className="text-gray-700">(TRON)</span>
          </SelectItem>
          <SelectItem value="usdt-tron">
            USDT <span className="text-gray-700">(TRON)</span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
