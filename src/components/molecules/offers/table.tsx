"use client";

import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
  SelectCoin,
  TokenInput,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ConnectModal } from "@/components/modals";
import { TableItem } from "@/components/molecules";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Offer } from "@/types/offer";
import axios from "axios";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";

export const OffersTable = () => {
  const [tokenToBuy, setTokenToBuy] = useState("eth-opt");
  const [tokenToSell, setTokenToSell] = useState("eth-base");
  const [amountToBuy, setAmountToBuy] = useState("0");

  const [sortByAmount, setSortByAmount] = useState<"asc" | "desc" | null>(null);
  const [sortByRate, setSortByRate] = useState<"asc" | "desc" | null>(null);

  const {
    data: tableData,
    isError,
    isLoading,
    refetch,
  } = useQuery<Offer[]>({
    queryKey: ["home-page-ads", tokenToBuy, tokenToSell, amountToBuy],
    queryFn: async () => {
      const result = await axios.get(
        `/api/offer/get_all?tokenToBuy=${tokenToBuy}&tokenToSell=${tokenToSell}&amountToBuy=${amountToBuy}&showEmpty=${false}`,
      );
      return result.data.orders || [];
    },
  });

  const sortTableData = (data: Offer[]) => {
    let sortedData = [...data];

    if (sortByAmount) {
      sortedData.sort((a, b) => {
        const diff = Number(a.srcAmountLD) - Number(b.srcAmountLD);
        return sortByAmount === "asc" ? diff : -diff;
      });
    }

    if (sortByRate) {
      sortedData.sort((a, b) => {
        const diff = Number(a.exchangeRateSD) - Number(b.exchangeRateSD);
        return sortByRate === "asc" ? diff : -diff;
      });
    }

    return sortedData;
  };

  const sortedTableData = tableData ? sortTableData(tableData) : [];

  const handleSortByAmount = () => {
    if (sortByAmount === "asc") {
      setSortByAmount("desc");
    } else if (sortByAmount === "desc") {
      setSortByAmount(null);
    } else {
      setSortByAmount("asc");
    }
    setSortByRate(null);
  };

  const handleSortByRate = () => {
    if (sortByRate === "asc") {
      setSortByRate("desc");
    } else if (sortByRate === "desc") {
      setSortByRate(null);
    } else {
      setSortByRate("asc");
    }
    setSortByAmount(null);
  };

  const isEmptyAdsList = sortedTableData && sortedTableData.length === 0;
  const heightOfTable =
    isEmptyAdsList || isLoading || isError ? "h-[425px]" : "flex-grow";

  return (
    <>
      <div className="flex w-full lg:h-20 justify-between items-center lg:mb-0">
        <div className="flex flex-col-reverse lg:flex-row w-full justify-between">
          <div className="flex flex-col w-full mt-5 lg:mt-0">
            <label className="text-xs mb-2 ml-2 text-gray-700">
              You Receive
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
              Amount to Receive
            </label>
            <TokenInput
              value={amountToBuy}
              setValue={setAmountToBuy}
              className={"mt-0"}
            />
          </div>
        </div>
        <div className="flex flex-col-reverse lg:flex-row w-full ml-3 lg:ml-0">
          <div className="flex flex-col w-full lg:pl-4 mt-5 lg:mt-0">
            <label className="text-xs mb-2 ml-2 text-gray-700">You pay</label>
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
        <div className="hidden lg:sticky lg:top-0 lg:bg-blur lg:border-b lg:border-gray-800 w-full lg:flex justify-center items-center text-sm z-10">
          <div className="py-2 px-5 w-[95%] flex justify-around items-center h-10 text-gray-700">
            <span className="w-[240px]">Advertiser</span>
            <span
              className={cn(
                "w-full text-center ml-5 cursor-pointer flex items-center justify-center",
                sortByRate !== null && "text-white",
              )}
              onClick={handleSortByRate}
            >
              Exchange Rate
              {renderIcon(sortByRate)}
            </span>
            <span
              className={cn(
                "w-full text-center mr-7 cursor-pointer flex items-center justify-center",
                sortByAmount !== null && "text-white",
              )}
              onClick={handleSortByAmount}
            >
              Max Amount
              {renderIcon(sortByAmount)}
            </span>
            <span className="text-end pr-5 w-[160px]">Trade</span>
          </div>
        </div>

        {isLoading && <LoadingComponent />}

        {isError && <ErrorComponent refetch={refetch} />}

        {isEmptyAdsList && <EmptyComponent refetch={refetch} />}

        {sortedTableData &&
          sortedTableData.map((item: any, i: number) => (
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
              isLast={i === sortedTableData.length - 1}
            />
          ))}
      </div>
    </>
  );
};

const renderIcon = (sortStatus: "asc" | "desc" | null) => {
  if (sortStatus === "asc") {
    return <ArrowUp className="ml-2 stroke-white" size={13} />;
  }
  if (sortStatus === "desc") {
    return <ArrowDown className="ml-2 stroke-white" size={13} />;
  }
  return <ArrowDownUp className="ml-2 stroke-gray-700" size={13} />;
};
