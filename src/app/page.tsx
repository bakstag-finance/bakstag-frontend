"use client";

import { ChangeEvent, useState } from "react";
import { Button, Input, SelectCoin } from "@/components/ui";
import { ConnectModal, CreateModal } from "@/components/modals";
import { useQuery } from "@tanstack/react-query";
import { Clock10 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidTokenAmount } from "@/lib/helpers";
import axios from "axios";
import { Order } from "@/types/order";
import { TableItem } from "@/components/molecules";

export default function Home() {
  const [tokenToBuy, setTokenToBuy] = useState("eth-opt");
  const [tokenToSell, setTokenToSell] = useState("eth-opt");
  const [amountToBuy, setAmountToBuy] = useState("0.0");

  const {
    data: tableData,
    isError,
    isLoading,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["home-page-ads", tokenToBuy, tokenToSell, amountToBuy],
    queryFn: async () => {
      const result = await axios.get(
        `/api/orders/get_all?tokenToBuy=${tokenToBuy}&tokenToSell=${tokenToSell}&amountToBuy=${amountToBuy}&showEmpty=${false}`,
      );
      return result.data.orders;
    },
  });

  const isEmptyAdsList = tableData && tableData.length === 0;
  const heightOfTable =
    isEmptyAdsList || isLoading || isError ? "h-[425px]" : "flex-grow";

  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setAmountToBuy(value);
  };

  return (
    <main className="flex h-dvh flex-col items-center bg-black text-white">
      <div className="w-full max-w-[748px] h-full py-5 px-5 lg:px-0 flex flex-col">
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
            <div className="flex flex-col w-full lg:pl-4">
              <label className="text-xs mb-2 ml-2 text-gray-700">
                Amount to Buy
              </label>
              <Input
                className={cn(
                  "bg-black border rounded-lg ",
                  isValidTokenAmount(amountToBuy)
                    ? "border-gray-800"
                    : "border-red-200  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
                )}
                value={amountToBuy}
                onChange={inputChangeHandler}
                placeholder="0.0"
                required
              />
            </div>
          </div>
          <div className="flex flex-col-reverse lg:flex-row w-full ml-3 lg:ml-0">
            <div className="flex flex-col w-full lg:pl-4 mt-5 lg:mt-0">
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
            <div className="px-0 mt-6 flex justify-center items-center h-full w-full lg:pl-4">
              <ConnectModal refetch={refetch} />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "mt-5 lg:mt-2 w-full border overflow-y-auto scroll-smooth border-gray-800 rounded-xl flex flex-col justify-start items-center",
            heightOfTable,
          )}
        >
          <div className="hidden border-b border-gray-800 w-full lg:flex justify-center items-center text-sm">
            <div className="py-2 px-5 w-[95%] flex justify-around items-center h-10 text-gray-700">
              <span className="w-[240px]">Advertiser</span>
              <span className="w-full text-center ml-5">Exchange Rate</span>
              <span className="w-full text-center mr-7">Max Amount</span>
              <span className="text-end pr-5 w-[160px]">Trade</span>
            </div>
          </div>

          {isLoading && <LoadingComponent />}

          {isError && <ErrorComponent refetch={refetch} />}

          {isEmptyAdsList && <EmptyComponent refetch={refetch} />}

          {tableData &&
            tableData?.map((item: any, i: number) => (
              <>
                <TableItem
                  refetch={refetch}
                  order={{
                    srcAmountLD: item.srcAmountLD,
                    srcToken: {
                      ticker: item.srcTokenTicker,
                      network: item.srcTokenNetwork,
                    },
                    dstToken: {
                      ticker: item.dstTokenTicker,
                      network: item.dstTokenNetwork,
                    },
                    offerId: item.offerId,
                    srcTokenAddress: item.srcTokenAddress,
                    dstTokenAddress: item.dstTokenAddress,
                    exchangeRateSD: item.exchangeRateSD,
                    dstSellerAddress: item.dstSellerAddress,
                  }}
                  key={`order-id-${i}`}
                  isLast={i === tableData.length - 1}
                />
              </>
            ))}
        </div>
      </div>
    </main>
  );
}

const LoadingComponent = () => {
  return (
    <div className="flex justify-center items-center h-full my-full">
      <Button variant="secondary" className={"rounded-xl"}>
        <Clock10 className="w-5 h-5 mr-2" /> Fetching Ads
      </Button>
    </div>
  );
};

const ErrorComponent = ({ refetch }: { refetch: () => void }) => {
  return (
    <div className="flex justify-center items-center h-full my-full">
      <Button variant="destructive" onClick={refetch} className={"rounded-xl"}>
        Fetching Failed (Retry)
      </Button>
    </div>
  );
};

const EmptyComponent = ({ refetch }: { refetch: () => void }) => {
  return (
    <div className="flex justify-center items-center h-full my-full">
      <CreateModal buttonText={"Create & Publish Ad"} refetch={refetch} />
    </div>
  );
};
