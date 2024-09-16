import { cn } from "@/lib/utils";
import { AcceptModal } from "../modals";
import { addressFormat, getTokenField } from "@/lib/helpers";
import { formatUnits } from "viem";
import { OrderProps } from "@/types/order";

interface Props {
  order: OrderProps;
  refetch: () => void;
  isLast: boolean;
}
export const TableItem = ({ order, refetch, isLast }: Props) => {
  const { dstSellerAddress, srcAmountLD, exchangeRateSD, srcToken, dstToken } =
    order;
  const formatedAddress = addressFormat(dstSellerAddress);

  const srcTokenDecimals = getTokenField(
    srcToken.ticker,
    srcToken.network,
    "decimals",
  );

  const formatedSrcAmount = formatUnits(BigInt(srcAmountLD), srcTokenDecimals);
  const formatedDstAmount = formatUnits(BigInt(exchangeRateSD), 6);

  return (
    <>
      <div className="lg:hidden w-full">
        <div
          className={cn(
            "flex flex-row items-end justify-center text-white h-36 px-5 py-3 w-full",
            isLast ? "" : "border-b border-gray-800",
          )}
        >
          <div className="flex w-full h-full flex-col justify-between">
            <span className="w-full text-sm font-normal">
              {formatedAddress}
            </span>
            <span className="font-semibold w-full text-lg">
              {formatedDstAmount}{" "}
              <span className="text-gray-700">
                {dstToken.ticker} ({dstToken.network})
              </span>{" "}
              = 1{" "}
              <span className={"text-gray-700"}>
                {srcToken.ticker} ({srcToken.network})
              </span>
            </span>
            <div className="flex flex-col w-full font-normal">
              <span className="text-gray-700 text-xs">Max Amount:</span>
              <span className="w-full">
                {formatedSrcAmount}{" "}
                <span className="text-gray-700">
                  {dstToken.ticker} ({dstToken.network})
                </span>
              </span>
            </div>
          </div>
          <AcceptModal order={order} refetch={refetch} />
        </div>
      </div>

      <div className="hidden lg:block text-sm w-full">
        <div className="flex justify-around items-center h-20">
          <div
            className={cn(
              "p-5 w-[95%] flex justify-around items-center border-gray-800 border-b",
              isLast && "border-none",
            )}
          >
            <span className="">{formatedAddress}</span>
            <span className="w-full text-center ml-10">
              {formatedDstAmount}{" "}
              <span className="text-gray-700">
                {dstToken.ticker} ({dstToken.network})
              </span>{" "}
              = 1{" "}
              <span className={"text-gray-700"}>
                {srcToken.ticker} ({srcToken.network})
              </span>
            </span>
            <span className="w-full text-center mr-5">
              {formatedSrcAmount}{" "}
              <span className="text-gray-700">
                {srcToken.ticker} ({srcToken.network})
              </span>
            </span>
            <div className="flex justify-end">
              <AcceptModal order={order} refetch={refetch} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
