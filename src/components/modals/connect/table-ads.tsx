import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CreateModal } from "@/components/modals/create";

import {
  SelectCoin,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  LoadingComponent,
  ErrorComponent,
  EmptyComponent,
} from "@/components/ui";
import { Squircle } from "@squircle-js/react";

import { useAccount } from "wagmi";
import { formatUnits } from "viem";

import { Offer } from "@/types/offer";
import { cn } from "@/lib/utils";
import { formatNumberWithCommas } from "@/lib/helpers/formating";

import { Trash } from "lucide-react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Offer>>;
}

type FilterType = "new" | "old";
export const TableComponent = ({ setStep, setOrderData }: Props) => {
  const { address } = useAccount();
  const tronWallet = useWallet();

  const [tokenToBuy, setTokenToBuy] = useState("");
  const [timeFilter, setTimeFilter] = useState<FilterType>("new");

  const isWalletConnected = !!address || tronWallet.connected;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<Offer[]>({
    queryKey: [
      "table-ads",
      tokenToBuy,
      address,
      tronWallet.address,
      timeFilter,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (address) {
        params.append("address", encodeURIComponent(address));
      }

      if (tronWallet?.address) {
        const tronWeb = (window as any).tronWeb as any;
        const hexAddress = tronWeb.address.toHex(tronWallet.address).substring(2);

        params.append(
          "tronWalletAddress",
          encodeURIComponent(`0x${hexAddress}`),
        );
      }

      params.append("tokenToBuy", tokenToBuy);
      params.append("page", page.toString());
      params.append("limit", "5");
      params.append("amountToBuy", "0");
      params.append("showEmpty", "true");

      const result = await axios.get(`/api/offer/get_all?${params.toString()}`);
      let offers = result.data.offers || [];

      void sideQueryPagination(offers);
      return offers;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setPage(1);
    setAllOffers([]);
    void refetch();
  }, [tokenToBuy, address, tronWallet.address, timeFilter]);

  const sortByTime = (data: Offer[]) => {
    let offers;

    if (timeFilter === "new") {
      offers = data.sort(
        (a: Offer, b: Offer) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (timeFilter === "old") {
      offers = data.sort(
        (a: Offer, b: Offer) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return offers;
  };

  const sortedTableData = sortByTime(allOffers);

  const sideQueryPagination = (newData: Offer[]) => {
    if (newData.length === 0) {
      setHasMore(false);
    } else {
      setAllOffers((prev) => [...prev, ...newData]);
    }
  };

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
    <div className="w-full flex flex-col">
      {isWalletConnected && sortedTableData && sortedTableData.length >= 0 && (
        <FilterSection
          tokenToBuy={tokenToBuy}
          setTokenToBuy={setTokenToBuy}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
      )}
      <TableContent
        tableData={sortedTableData || []}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        setStep={setStep}
        hasMore={hasMore}
        setOrderData={setOrderData}
        lastOfferElementRef={lastOfferElementRef}
      />
      <div className="mt-5">
        <CreateModal buttonText={"Create Ad"} refetch={refetch} />
      </div>
    </div>
  );
};

const FilterSection = ({
  tokenToBuy,
  setTokenToBuy,
  timeFilter,
  setTimeFilter,
}: {
  tokenToBuy: string;
  setTokenToBuy: (value: string) => void;
  timeFilter: string;
  setTimeFilter: Dispatch<SetStateAction<FilterType>>;
}) => (
  <div className="w-full flex flex-row justify-between mt-2">
    <SelectCoin
      placeholder="Token to buy"
      value={tokenToBuy}
      setValue={setTokenToBuy}
    />
    <Select
      value={timeFilter}
      onValueChange={(value) => setTimeFilter(value as FilterType)}
    >
      <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
        <SelectTrigger
          className="w-full ml-2 border rounded-md"
          showChevronUpDown
        >
          <SelectValue placeholder="Most Recent" />
        </SelectTrigger>
      </Squircle>
      <SelectContent
        className="bg-black text-white p-2 hover:border-gray-800 focus:border-gray-800"
        defaultValue="New"
      >
        <SelectGroup>
          <SelectItem value="new">Newest</SelectItem>
          <SelectItem value="old">Oldest</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

const TableContent = ({
  tableData,
  isLoading,
  isError,
  isFetching,
  refetch,
  setStep,
  setOrderData,
  hasMore,
  lastOfferElementRef,
}: {
  tableData: Offer[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  hasMore: boolean;
  refetch: () => void;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Offer>>;
  lastOfferElementRef: React.Ref<HTMLDivElement>;
}) => (
  <div className="mt-5 w-full flex flex-col h-64 overflow-y-scroll no-scrollbar rounded-xl border border-gray-800 p-2">
    {isLoading && <LoadingComponent />}
    {isError && <ErrorComponent refetch={refetch} />}
    {tableData && !isLoading && tableData.length === 0 && (
      <EmptyComponent
        refetch={refetch}
        error={{
          title: "No Ads Yet",
          subtitle: "Create your first ad",
        }}
      />
    )}
    {tableData && tableData.length > 0 && (
      <>
        {tableData.map((item, i) => (
          <TableRow
            key={i}
            item={item}
            setStep={setStep}
            setOrderData={setOrderData}
            isLast={i === tableData.length - 1}
            ref={i === tableData.length - 1 ? lastOfferElementRef : null}
          />
        ))}
      </>
    )}

    {isFetching && hasMore && !isLoading && (
      <div className="py-5 flex justify-center w-full">
        <LoadingComponent />
      </div>
    )}
  </div>
);

const TableRow = forwardRef<
  HTMLDivElement,
  {
    item: Offer;
    setStep: Dispatch<SetStateAction<ConnectModalStep>>;
    setOrderData: Dispatch<SetStateAction<Offer>>;
    isLast: boolean;
  }
>(({ item, setStep, setOrderData, isLast }, ref) => {
  const formattedSrcAmount = formatNumberWithCommas(
    Number(formatUnits(BigInt(item.srcAmountLD), 18)),
  );
  const formattedDstAmount = formatNumberWithCommas(
    Number(formatUnits(BigInt(item.exchangeRateSD), 6)),
  );

  return (
    <div
      ref={ref}
      className={cn(
        "w-full flex flex-row h-28 px-2 py-2",
        isLast ? "" : " border-b border-gray-800",
      )}
    >
      <div className="flex flex-col w-full justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-gray-700 font-semibold">
            Exchange Rate
          </span>
          <span className="flex items-start text-sm">
            {formattedDstAmount + " " + item.dstTokenTicker}{" "}
            <span className="ml-1 text-gray-700">
              ({item.dstTokenNetwork}){" "}
            </span>
            = 1 {item.srcTokenTicker}
            <span className="ml-1  text-gray-700">
              {" "}
              ({item.srcTokenNetwork})
            </span>
          </span>
        </div>
        <div className="flex w-full justify-between">
          <div className="flex flex-col mt-1">
            <span className="text-xs text-gray-700 font-semibold">
              Available Amount
            </span>
            <span className="text-lg flex items-start">
              {formattedSrcAmount}{" "}
              <span className="ml-1 mt-1 text-gray-700 text-sm">
                {item.srcTokenTicker} ({item.srcTokenNetwork})
              </span>
            </span>
          </div>
          <div className="flex justify-center items-end w-10">
            <Trash
              className="cursor-pointer"
              onClick={() => {
                setStep("delete");
                setOrderData(item);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

TableRow.displayName = "TableRow";
