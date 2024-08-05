import { Clock10, Ghost, Trash } from "lucide-react";
import { CreateModal } from "../modals";
import {
  Button,
  SelectCoin,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

interface Props {
  setIsDeletingStep: Dispatch<SetStateAction<boolean>>;
}

export const TableComponent = ({ setIsDeletingStep }: Props) => {
  const { address } = useAccount();
  const [tokenToBuy, setTokenToBuy] = useState("");

  const {
    data: tableData,
    isLoading,
    isError,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["table-ads", tokenToBuy, address],
    queryFn: async () => {
      const result = await axios.get(
        `/api/orders/get_all?tokenToBuy=${tokenToBuy}&address=${address}&amountToBuy=0`,
      );
      return result.data.orders;
    },
  });

  return (
    <>
      <div className="w-full flex flex-col">
        {tableData && tableData.length > 0 && (
          <div className="w-full flex flex-row justify-between mt-2">
            <SelectCoin
              placeholder={"Token to buy"}
              value={tokenToBuy}
              setValue={(value) => setTokenToBuy(value)}
            />
            <Select>
              <SelectTrigger className="w-full ml-2 border rounded-md">
                <SelectValue placeholder={"Most Recent"} />
              </SelectTrigger>
              <SelectContent
                className={
                  "bg-black text-white p-2 hover:border-gray-800 focus:border-gray-800"
                }
                defaultValue={"most"}
              >
                <SelectGroup>
                  <SelectItem value="most">Most Recent</SelectItem>
                  <SelectItem value="new">Newest</SelectItem>
                  <SelectItem value="old">Oldest</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="mt-5 w-full flex flex-col h-64 overflow-scroll rounded-xl border border-gray-800 p-2">
          {tableData &&
            tableData.length > 0 &&
            tableData.map((item: any, i: number) => {
              const formatedSrcAmount = formatUnits(
                BigInt(item.srcAmountLD),
                18,
              );
              const formatedDstAmount = formatUnits(
                BigInt(item.exchangeRateSD),
                18,
              );

              return (
                <div
                  className={
                    "w-full flex flex-row  h-28 px-2 py-2 border-b border-gray-800"
                  }
                  key={`modal-order-${i}`}
                >
                  <div className="flex flex-col w-full justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-700 font-semibold">
                        Exchange Rate
                      </span>
                      <span className="text-lg flex items-start">
                        {formatedDstAmount}{" "}
                        <span className={"ml-1 mt-1 text-gray-700 text-sm"}>
                          {item.dstTokenTicker} ({item.dstTokenNetwork})
                        </span>{" "}
                      </span>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="flex flex-col mt-1">
                        <span className="text-xs text-gray-700 font-semibold">
                          Avaliable Amount
                        </span>
                        <span className="text-lg flex items-start">
                          {formatedSrcAmount}{" "}
                          <span className={"ml-1 mt-1 text-gray-700 text-sm"}>
                            {item.srcTokenTicker} ({item.srcTokenNetwork})
                          </span>{" "}
                        </span>
                      </div>
                      <div className="flex justify-center items-end w-10">
                        <Trash
                          className="cursor-pointer"
                          onClick={() => setIsDeletingStep(true)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          {tableData && tableData.length === 0 && (
            <div className="w-full h-full flex flex-col justify-center items-center text-sm">
              <Button variant="secondary">
                <Clock10 className="w-5 h-5 mr-2" /> Fetching Ads
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="w-full h-full flex flex-col justify-center items-center text-sm">
              <Ghost className="w-20 h-28 stroke-[0.25]" />
              <span>No Ads Yet</span>
              <span className="text-gray-700 text-xs">
                create & start advertising
              </span>
            </div>
          )}

          {isError && (
            <div className="w-full h-full flex flex-col justify-center items-center text-sm">
              <Button variant="destructive" onClick={() => refetch()}>
                Fetching Failed (Retry)
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">
        <CreateModal buttonText={"+ Create Add"} />
      </div>
    </>
  );
};
