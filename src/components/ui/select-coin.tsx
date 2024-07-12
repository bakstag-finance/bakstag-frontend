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
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={"bg-black text-white p-2"}>
        <SelectGroup>
          <SelectLabel>Optimism Tokens</SelectLabel>
          <SelectItem value="eth-opt">ETH (Optimism)</SelectItem>
          <SelectItem value="op-opt">OP (Optimism)</SelectItem>
          <SelectItem value="usdc-opt">USDC (Optimism)</SelectItem>
          <SelectItem value="usdt-opt">USDC (Optimism)</SelectItem>
        </SelectGroup>
        <SelectSeparator className={"bg-white"} />
        <SelectGroup>
          <SelectLabel className={"text-gray-700"}>Solana Tokens</SelectLabel>
          <SelectItem value="sol-sol">SOL (Solana)</SelectItem>
          <SelectItem value="usdc-sol">USDC (Solana)</SelectItem>
          <SelectItem value="usdt-sol">USDT (Solana)</SelectItem>
        </SelectGroup>
        <SelectSeparator className={"bg-white"} />
        <SelectGroup>
          <SelectLabel>Base Tokens</SelectLabel>
          <SelectItem value="eth-base">ETH (Base)</SelectItem>
          <SelectItem value="usdc-base">USDC (Base)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
