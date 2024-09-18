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
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} className="border border-red" />
      </SelectTrigger>
      <SelectContent
        className={
          "bg-black text-white p-2 hover:border-gray-800 focus:border-gray-800"
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
      </SelectContent>
    </Select>
  );
};
