"use client";

import { useState } from "react";
import { Button, Input, SelectCoin } from "@/components/ui";
import { AcceptModal, ConnectModal, CreateModal } from "@/components/modals";
import { useQuery } from "@tanstack/react-query";
import { Clock10 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNumberOrCommaNumber } from "@/lib/helpers";

export default function Home() {
  const [tokenToBuy, setTokenToBuy] = useState("");
  const [tokenToSell, setTokenToSell] = useState("");
  const [amountToBuy, setAmountToBuy] = useState("0");

  const {
    data: tableData,
    isError,
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["home-page-ads"],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = Array.from(Array(20));
          resolve(result);
        }, 3000);
      });
    },
  });

  return (
    <main className="flex h-screen flex-col items-center justify-start bg-black text-white">
      <div className="w-full max-w-[748px] h-full py-5 px-5 lg:px-0">
        <div className="flex w-full lg:h-20 justify-between items-center lg:mb-0">
          <div className="flex flex-col-reverse lg:flex-row w-full justify-between">
            <div className="flex flex-col w-full mt-5 lg:mt-0">
              <label className="text-xs mb-2 ml-2 text-gray-700">
                Token to Buy
              </label>
              <SelectCoin
                placeholder="Token to Buy"
                value={tokenToBuy}
                setValue={(s) => {
                  setTokenToBuy(s);
                }}
              />
            </div>
            <div className="flex flex-col w-full lg:pl-5">
              <label className="text-xs mb-2 ml-2 text-gray-700">
                Amount to Buy
              </label>
              <Input
                className={cn(
                  "bg-black border rounded-lg ",
                  isNumberOrCommaNumber(amountToBuy)
                    ? "border-gray-800"
                    : "border-red-200  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
                )}
                value={amountToBuy}
                onChange={(e) => setAmountToBuy(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col-reverse lg:flex-row w-full ml-3 lg:ml-0">
            <div className="flex flex-col w-full lg:pl-5 mt-5 lg:mt-0">
              <label className="text-xs mb-2 ml-2 text-gray-700">
                Token to Sell
              </label>
              <SelectCoin
                placeholder="Token to Sell"
                value={tokenToSell}
                setValue={(s) => {
                  setTokenToSell(s);
                }}
              />
            </div>
            <div className="px-0 mt-6 flex justify-center items-center h-full w-full lg:pl-5">
              <ConnectModal />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "mt-5 w-full border overflow-y-auto scroll-smooth border-gray-800 rounded-xl flex flex-col justify-start items-center",
            isLoading || isError ? "h-[425px]" : "h-[80%] lg:h-[88%]",
          )}
        >
          <div className="hidden border-b border-gray-800 w-full lg:flex justify-center items-center text-sm">
            <div className="py-2 px-5 w-[95%] flex justify-around items-center h-10 text-gray-700">
              <span className="w-full">Advertiser</span>
              <span className="w-full text-center">Exchange Rate</span>
              <span className="w-full text-center">Max Amount</span>
              <span className="w-full text-end pr-5">Trade</span>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-full my-full">
              <Button variant="secondary">
                <Clock10 className="w-5 h-5 mr-2" /> Fetching Ads
              </Button>
            </div>
          )}

          {isError && (
            <div className="flex justify-center items-center h-full my-full">
              <Button variant="destructive" onClick={() => refetch()}>
                Fetching Failed (Retry)
              </Button>
            </div>
          )}

          {tableData &&
            tableData.map((_: any, i: number) => (
              <>
                <div className="lg:hidden w-full" key={`offer-mb-${i}`}>
                  <div
                    className={cn(
                      "flex flex-row items-end justify-center text-white h-32 border-gray-800 px-5 py-3 w-full",
                      i !== tableData.length && "border-b",
                    )}
                  >
                    <div className="flex w-full h-full flex-col justify-between">
                      <span className="w-full">0x71...976f</span>
                      <span className="font-semibold w-full">
                        0.22 <span className="text-gray-700">SOL</span>
                      </span>
                      <div className="flex flex-col w-full">
                        <span className="text-gray-700">Max Amount:</span>
                        <span className="w-full">11.865 ETH (Base)</span>
                      </div>
                    </div>
                    <AcceptModal />
                  </div>
                </div>

                <div
                  className="hidden lg:block text-sm w-full"
                  key={`offer-${i}`}
                >
                  <div className="flex justify-around items-center h-20">
                    <div
                      className={cn(
                        "p-5 w-[95%] flex justify-around items-center border-gray-800",
                        i === tableData.length - 1 ? "" : "border-b",
                      )}
                    >
                      <span className="w-full">0x71...976f</span>
                      <span className="w-full text-center">
                        0.22 <span className="text-gray-700">SOL</span>
                      </span>
                      <span className="w-full text-center">
                        11.865 <span className="text-gray-700">ETH (Base)</span>
                      </span>
                      <div className="w-full flex justify-end">
                        <AcceptModal />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ))}
        </div>
      </div>
    </main>
  );
}
