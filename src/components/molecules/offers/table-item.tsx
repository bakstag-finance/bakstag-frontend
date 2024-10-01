import { cn } from "@/lib/utils";
import { AcceptModal } from "../../modals";
import { addressFormat, getTokenField } from "@/lib/helpers";
import { formatUnits } from "viem";

import { formatNumberWithCommas } from "@/lib/helpers/formating";
import React from "react";
import { Offer } from "@/types/offer";

interface Props {
  offer: Offer;
  refetch: () => void;
  isLast: boolean;
}

export const TableItem = React.forwardRef<HTMLDivElement, Props>(
  ({ offer, refetch, isLast }, ref) => {
    const {
      dstSellerAddress,
      srcAmountLD,
      exchangeRateSD,
      srcTokenTicker,
      srcTokenNetwork,
      dstTokenTicker,
      dstTokenNetwork,
    } = offer;
    const formatedAddress = addressFormat(dstSellerAddress);

    const srcTokenDecimals = getTokenField(
      srcTokenTicker,
      srcTokenNetwork,
      "decimals",
    );

    const formatedSrcAmount = formatNumberWithCommas(
      Number(formatUnits(BigInt(srcAmountLD), srcTokenDecimals)),
    );
    const formatedDstAmount = formatNumberWithCommas(
      Number(formatUnits(BigInt(exchangeRateSD), 6)),
    );

    return (
      <>
        <div className="lg:hidden w-full" ref={ref}>
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
                  {dstTokenTicker} ({dstTokenNetwork})
                </span>{" "}
                = 1{" "}
                <span className={"text-gray-700"}>
                  {srcTokenTicker} ({srcTokenNetwork})
                </span>
              </span>
              <div className="flex flex-col w-full font-normal">
                <span className="text-gray-700 text-xs">Max Amount:</span>
                <span className="w-full">
                  {formatedSrcAmount}{" "}
                  <span className="text-gray-700">
                    {srcTokenTicker} ({srcTokenNetwork})
                  </span>
                </span>
              </div>
            </div>
            <AcceptModal offer={offer} refetch={refetch} isOpenedByBtn={true} />
          </div>
        </div>

        <div className="hidden lg:block text-sm w-full">
          <div className="flex justify-around items-center h-20" ref={ref}>
            <div
              className={cn(
                "p-5 w-[95%] flex justify-around items-center border-gray-800 border-b",
                isLast && "border-none",
              )}
            >
              <span className="">{formatedAddress}</span>
              <span className="w-full text-center ml-7">
                {formatedDstAmount}{" "}
                <span className="text-gray-700">
                  {dstTokenTicker} ({dstTokenNetwork})
                </span>{" "}
                = 1{" "}
                <span className={"text-gray-700"}>
                  {srcTokenTicker} ({srcTokenNetwork})
                </span>
              </span>
              <span className="w-full text-center mr-5">
                {formatedSrcAmount}{" "}
                <span className="text-gray-700">
                  {srcTokenTicker} ({srcTokenNetwork})
                </span>
              </span>
              <div className="flex justify-end">
                <AcceptModal
                  offer={offer}
                  refetch={refetch}
                  isOpenedByBtn={true}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);

TableItem.displayName = "TableItem";
