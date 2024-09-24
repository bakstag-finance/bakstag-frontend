import { Trash } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Offer } from "@/types/offer";
import { cn } from "@/lib/utils";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { Squircle } from "@squircle-js/react";

type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Offer>>;
}

type FilterType = "new" | "old";
export const TableComponent = ({ setStep, setOrderData }: Props) => {
  const { address } = useAccount();
  const [tokenToBuy, setTokenToBuy] = useState("");
  const [timeFilter, setTimeFilter] = useState<FilterType>("new");

  const isWalletConntected = !!address;
  const {
    data: tableData,
    isLoading,
    isError,
    refetch,
  } = useQuery<Offer[]>({
    queryKey: ["table-ads", tokenToBuy, address, timeFilter],
    queryFn: async () => {
      const result = await axios.get(
        `/api/offer/get_all?tokenToBuy=${tokenToBuy}&address=${address}&amountToBuy=0&showEmpty=true`,
      );
      let orders = result.data.orders;

      if (timeFilter === "new") {
        orders = orders.sort(
          (a: Offer, b: Offer) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      } else if (timeFilter === "old") {
        orders = orders.sort(
          (a: Offer, b: Offer) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      }

      return orders;
    },
  });

  return (
    <div className="w-full flex flex-col">
      {isWalletConntected && tableData && tableData.length >= 2 && (
        <FilterSection
          tokenToBuy={tokenToBuy}
          setTokenToBuy={setTokenToBuy}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
      )}
      <TableContent
        tableData={tableData || []}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        setStep={setStep}
        setOrderData={setOrderData}
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
  setTokenToBuy: Dispatch<SetStateAction<string>>;
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
  refetch,
  setStep,
  setOrderData,
}: {
  tableData: Offer[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Offer>>;
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
          />
        ))}
      </>
    )}
  </div>
);

const TableRow = ({
  item,
  setStep,
  setOrderData,
  isLast,
}: {
  item: Offer;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Offer>>;
  isLast: boolean;
}) => {
  const formattedSrcAmount = formatNumberWithCommas(
    Number(formatUnits(BigInt(item.srcAmountLD), 18)),
  );
  const formattedDstAmount = formatNumberWithCommas(
    Number(formatUnits(BigInt(item.exchangeRateSD), 6)),
  );

  return (
    <div
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
};
