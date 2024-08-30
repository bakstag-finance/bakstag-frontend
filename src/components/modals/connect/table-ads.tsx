import { Clock10, Ghost, Trash } from "lucide-react";
import { CreateModal } from "@/components/modals/create";
import {
  Button,
  SelectCoin,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Order } from "@/types/order";

type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Order>>;
}

export const TableComponent = ({ setStep, setOrderData }: Props) => {
  const { address } = useAccount();
  const [tokenToBuy, setTokenToBuy] = useState("");

  const { data: tableData, isLoading, isError, refetch } = useQuery<Order[]>({
    queryKey: ["table-ads", tokenToBuy, address],
    queryFn: async () => {
      const result = await axios.get(
        `/api/orders/get_all?tokenToBuy=${tokenToBuy}&address=${address}&amountToBuy=0`,
      );
      return result.data.orders;
    },
  });

  return (
    <div className="w-full flex flex-col">
      <FilterSection tokenToBuy={tokenToBuy} setTokenToBuy={setTokenToBuy} />
      <TableContent
        tableData={tableData || []}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        setStep={setStep}
        setOrderData={setOrderData}
      />
      <div className="mt-5">
        <CreateModal buttonText={"+ Create Ad"} refetch={refetch} />
      </div>
    </div>
  );
};

const FilterSection = ({
  tokenToBuy,
  setTokenToBuy,
}: {
  tokenToBuy: string;
  setTokenToBuy: Dispatch<SetStateAction<string>>;
}) => (
  <div className="w-full flex flex-row justify-between mt-2">
    <SelectCoin
      placeholder="Token to buy"
      value={tokenToBuy}
      setValue={setTokenToBuy}
    />
    <Select>
      <SelectTrigger className="w-full ml-2 border rounded-md">
        <SelectValue placeholder="Most Recent" />
      </SelectTrigger>
      <SelectContent className="bg-black text-white p-2 hover:border-gray-800 focus:border-gray-800" defaultValue="most">
        <SelectGroup>
          <SelectItem value="most">Most Recent</SelectItem>
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
  setOrderData
}: {
  tableData: Order[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Order>>;
}) => (
  <div className="mt-5 w-full flex flex-col h-64 overflow-y-scroll no-scrollbar rounded-xl border border-gray-800 p-2">
    {isLoading && <LoadingState />}
    {isError && <ErrorState refetch={refetch} />}
    {tableData && !isLoading &&  tableData.length === 0 && <EmptyState />}
    {tableData && tableData.length > 0 && (
      <>
        {tableData.map((item, i) => (
          <TableRow key={i} item={item} setStep={setStep} setOrderData={setOrderData} />
        ))}
      </>
    )}
  </div>
);

const TableRow = ({
  item,
  setStep,
  setOrderData
}: {
  item: Order;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  setOrderData: Dispatch<SetStateAction<Order>>;
}) => {
  const formattedSrcAmount = formatUnits(BigInt(item.srcAmountLD), 18);
  const formattedDstAmount = formatUnits(BigInt(item.exchangeRateSD), 18);

  return (
    <div className="w-full flex flex-row h-28 px-2 py-2 border-b border-gray-800">
      <div className="flex flex-col w-full justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-gray-700 font-semibold">Exchange Rate</span>
          <span className="text-lg flex items-start">
            {formattedDstAmount}{" "}
            <span className="ml-1 mt-1 text-gray-700 text-sm">
              {item.dstTokenTicker} ({item.dstTokenNetwork})
            </span>
          </span>
        </div>
        <div className="flex w-full justify-between">
          <div className="flex flex-col mt-1">
            <span className="text-xs text-gray-700 font-semibold">Available Amount</span>
            <span className="text-lg flex items-start">
              {formattedSrcAmount}{" "}
              <span className="ml-1 mt-1 text-gray-700 text-sm">
                {item.srcTokenTicker} ({item.srcTokenNetwork})
              </span>
            </span>
          </div>
          <div className="flex justify-center items-end w-10">
            <Trash className="cursor-pointer" onClick={() => {
              setStep("delete");
              setOrderData(item)
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};


const LoadingState = () => (
  <div className="w-full h-full flex flex-col justify-center items-center text-sm">
    <Button variant="secondary">
      <Clock10 className="w-5 h-5 mr-2" /> Fetching Ads
    </Button>
  </div>
);


const ErrorState = ({ refetch }: { refetch: () => void }) => (
  <div className="w-full h-full flex flex-col justify-center items-center text-sm">
    <Button variant="destructive" onClick={refetch}>
      Fetching Failed (Retry)
    </Button>
  </div>
);


const EmptyState = () => (
  <div className="w-full h-full flex flex-col justify-center items-center text-sm">
    <Ghost className="w-20 h-28 stroke-[0.25]" />
    <span>No Ads Yet</span>
    <span className="text-gray-700 text-xs">Create & start advertising</span>
  </div>
);
