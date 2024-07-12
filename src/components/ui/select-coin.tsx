import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel, SelectSeparator,
    SelectTrigger,
    SelectValue
} from "./select";

interface Props {
    placeholder: string;
}

export const SelectCoin = ({placeholder, ...props}: Props) => {
    return (
        <Select>
            <SelectTrigger className="w-full">
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
                    <SelectLabel className={"text-gray-700"}>
                        Solana Tokens
                    </SelectLabel>
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
    )
}