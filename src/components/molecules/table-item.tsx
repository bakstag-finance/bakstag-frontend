import { cn } from "@/lib/utils";
import { AcceptModal } from "../modals";
import { addressFormat } from "@/lib/helpers";
import { formatUnits } from "viem";

interface Props {
  srcToken: {
    ticker: string;
    network: string;
  };
  dstToken: {
    ticker: string;
    network: string;
  };
  dstSellerAddress: string;
  offerId: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmountLD: string;
  exchangeRateSD: string;
}

export const TableItem = ({
  srcToken,
  dstToken,
  dstSellerAddress,
  srcAmountLD,
  exchangeRateSD,
}: Props) => {
  const formatedAddress = addressFormat(dstSellerAddress);
  const formatedSrcAmount = formatUnits(BigInt(srcAmountLD), 18);
  const formatedDstAmount = formatUnits(BigInt(exchangeRateSD), 18);
  return (
    <>
      <div className="lg:hidden w-full">
        <div
          className={cn(
            "flex flex-row items-end justify-center text-white h-36 border-gray-800 px-5 py-3 w-full border-b",
          )}
        >
          <div className="flex w-full h-full flex-col justify-between">
            <span className="w-full text-sm font-normal">
              {formatedAddress}
            </span>
            <span className="font-semibold w-full text-lg">
              {formatedSrcAmount}{" "}
              <span className="text-gray-700">{srcToken.ticker}</span>
            </span>
            <div className="flex flex-col w-full font-normal">
              <span className="text-gray-700 text-xs">Max Amount:</span>
              <span className="w-full">
                {formatedDstAmount}{" "}
                <span className="text-gray-700">
                  {dstToken.ticker} ({dstToken.network})
                </span>
              </span>
            </div>
          </div>
          <AcceptModal />
        </div>
      </div>

      <div className="hidden lg:block text-sm w-full">
        <div className="flex justify-around items-center h-20">
          <div
            className={cn(
              "p-5 w-[95%] flex justify-around items-center border-gray-800 border-b",
            )}
          >
            <span className="w-full">{formatedAddress}</span>
            <span className="w-full text-center">
              {formatedSrcAmount}{" "}
              <span className="text-gray-700">{srcToken.ticker}</span>
            </span>
            <span className="w-full text-center">
              {formatedDstAmount}{" "}
              <span className="text-gray-700">
                {dstToken.ticker} ({dstToken.network})
              </span>
            </span>
            <div className="w-full flex justify-end">
              <AcceptModal />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
