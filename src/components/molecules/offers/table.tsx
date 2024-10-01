"use client";

import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
  SelectCoin,
  TokenInput,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { AcceptModal, ConnectModal } from "@/components/modals";
import { TableItem } from "@/components/molecules";
import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { Offer } from "@/types/offer";
import axios from "axios";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import { isValidTokenAmount } from "@/lib/helpers";

export const OffersTable = () => {
  const [tokenToBuy, setTokenToBuy] = useState("eth-opt");
  const [tokenToSell, setTokenToSell] = useState("eth-base");
  const [amountToBuy, setAmountToBuy] = useState("0");

  const [sortByAmount, setSortByAmount] = useState<"asc" | "desc" | null>(null);
  const [sortByRate, setSortByRate] = useState<"asc" | "desc" | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);

  const { invalidateQueries } = useQueryClient();

  const { data, isError, isLoading, isFetching, refetch } = useQuery<Offer[]>({
    queryKey: ["home-page-ads", tokenToBuy, tokenToSell, amountToBuy, page],
    queryFn: async () => {
      const amountToQuery = isValidTokenAmount(amountToBuy) ? amountToBuy : "";
      const result = await axios.get(
        `/api/offer/get_all?tokenToBuy=${tokenToBuy}&tokenToSell=${tokenToSell}&amountToBuy=${amountToQuery}&page=${page}&limit=15&showEmpty=${false}`,
      );
      void sideQueryPagination(result.data);
      return result.data.offers || [];
    },
    placeholderData: keepPreviousData,
  });

  const sideQueryPagination = (newData: any) => {
    setAllOffers((prev) => {
      if (page === 1) return newData.offers;
      return [...prev, ...newData.offers];
    });
    setHasMore(newData.hasMore);
  };

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

  const sortedTableData = sortTableData(allOffers);

  const handleSortByAmount = () => {
    handleFilterChange();
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
    handleFilterChange();
    if (sortByRate === "asc") {
      setSortByRate("desc");
    } else if (sortByRate === "desc") {
      setSortByRate(null);
    } else {
      setSortByRate("asc");
    }
    setSortByAmount(null);
  };

  const handleFilterChange = () => {
    setPage(1);
    void invalidateQueries({
      queryKey: ["home-page-ads"],
    });
  };

  const isEmptyAdsList = sortedTableData && sortedTableData.length === 0;
  const heightOfTable =
    isEmptyAdsList || isLoading || isError ? "h-[425px]" : "flex-grow-0";

  const observer = useRef<IntersectionObserver | null>(null);
  const lastOfferElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isFetching || !hasMore) return;

    const callback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    observer.current = new IntersectionObserver(callback);
    if (lastOfferElementRef.current) {
      observer.current.observe(lastOfferElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isFetching, hasMore]);

  return (
    <Suspense>
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
          "mt-5 lg:mt-2 w-full border overflow-y-auto scroll-smooth border-gray-800 rounded-xl flex flex-col justify-start items-center transition-all",
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
              Amount
              {renderIcon(sortByAmount)}
            </span>
            <span className="text-end pr-5 w-[160px]">Trade</span>
          </div>
        </div>

        {isLoading && <LoadingComponent />}
        {isError && <ErrorComponent refetch={refetch} />}

        {!isLoading && !isError && isEmptyAdsList && (
          <EmptyComponent refetch={refetch} />
        )}

        {!isLoading && !isError && !isEmptyAdsList && (
          <div className="w-full flex-grow flex flex-col items-center justify-start">
            {sortedTableData.map((offer, idx) => (
              <TableItem
                key={`offer-${offer?.offerId}`}
                offer={offer}
                refetch={refetch}
                isLast={idx === sortedTableData.length - 1}
                ref={
                  idx === sortedTableData.length - 1
                    ? lastOfferElementRef
                    : null
                }
              />
            ))}
          </div>
        )}

        {isFetching && hasMore && !isLoading && (
          <div className="py-5 flex justify-center w-full">
            <LoadingComponent />
          </div>
        )}
      </div>
      <AcceptModal refetch={refetch} isOpenedByBtn={false} />
    </Suspense>
  );
};

const renderIcon = (sortState: "asc" | "desc" | null) => {
  if (sortState === "asc") return <ArrowUp size={16} className={"ml-1"} />;
  if (sortState === "desc") return <ArrowDown size={16} className={"ml-1"} />;
  return <ArrowDownUp size={16} className={"ml-1"} />;
};
