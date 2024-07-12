import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { AcceptModal, ConnectModal } from "@/components/modals";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white py-10 lg:py-12 px-5 lg:px-0">
      <div className={"w-full max-w-[785px]"}>
        <div
          className={
            "flex w-full lg:h-20 justify-between items-center mb-5 lg:mb-0"
          }
        >
          <div
            className={
              "flex flex-col-reverse lg:flex-row w-full justify-between"
            }
          >
            <div className={"flex flex-col w-full mt-5 lg:mt-0"}>
              <label>Token to Buy</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Token to buy" />
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
            </div>
            <div className={"flex flex-col w-full lg:pl-5"}>
              <label>Exchange Rate</label>
              <Input className={"bg-black border rounded-lg border-gray-800"} />
            </div>
          </div>
          <div
            className={"flex flex-col-reverse lg:flex-row w-full ml-3 lg:ml-0"}
          >
            <div className={"flex flex-col w-full lg:pl-5 mt-5 lg:mt-0"}>
              <label>Token to Sell</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Token to buy" />
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
            </div>
            <div
              className={
                "px-0 mt-6 flex justify-center items-center h-full w-full lg:pl-5"
              }
            >
              <ConnectModal />
            </div>
          </div>
        </div>
        <div
          className={
            "mt-5 w-full min-h-screen border border-gray-800 rounded-xl flex justify-center items-start"
          }
        >
          <div className={"lg:hidden w-full"}>
            {Array.from(Array(10)).map((_, i) => (
              <div
                className={
                  "flex flex-row items-end justify-center text-white h-32 border-b  border-gray-800 px-5 py-3"
                }
                key={`offer-mb-${i}`}
              >
                <div className={"flex w-full h-full flex-col justify-between"}>
                  <span className={"text-sm"}>0x71...976f</span>
                  <span className={"font-semibold"}>
                    0.22 <span className={"text-gray-700"}>SOL</span>
                  </span>
                  <div className={"flex flex-col"}>
                    <span className={"text-sm text-gray-700"}>Max Amount:</span>
                    <span>11.865 ETH (Base)</span>
                  </div>
                </div>
                <>
                  <AcceptModal />
                </>
              </div>
            ))}
          </div>
          <div className={"hidden lg:block w-full"}>
            <div
              className={"border-b border-gray-800 w-full flex justify-center"}
            >
              <div
                className={
                  "p-5 w-[95%] flex justify-around items-center h-10 text-gray-700"
                }
              >
                <span>Advertiser</span>
                <span>Exchange Rate</span>
                <span>Max Amount</span>
                <span>Trade</span>
              </div>
            </div>
            {Array.from(Array(10)).map((_, i) => (
              <>
                <div
                  className={"flex justify-around items-center h-20"}
                  key={`offer-${i}`}
                >
                  <div
                    className={
                      "p-5 w-[95%] flex justify-around items-center border-b border-gray-800"
                    }
                  >
                    <span>0x71...976f</span>
                    <span>0.22 SOL</span>
                    <span>11.865 ETH (Base)</span>
                    <AcceptModal />
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
