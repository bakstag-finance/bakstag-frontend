"use client";

import { Button, Copy } from "@/components/ui";
import { addressFormat } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CircleCheck,
  Clock10,
  Clock11,
  FileWarning,
  Redo2,
} from "lucide-react";
import axios from "axios";
import { tokensData } from "@/lib/constants";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

interface Props {
  destinationWallet: string;
  srcAddress: `0x${string}` | undefined;
  exchangeRate: number;
  srcTokenAmount: number;
  selectedSrcToken: string;
  selectedDstToken: string;
  transactionData: {
    txHash: string;
    srcEid: number;
    srcChainId: number;
    offerId: string;
    dstEid: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    dstSellerAddress: string;
    srcAmountLD: bigint;
    exchangeRateSD: bigint;
  };
  handleClose: () => void;
  handleRetry: () => void;
  setTransactionStatus: Dispatch<
    SetStateAction<"idle" | "pending" | "success">
  >;
}

const LAYER_ZERO_SCAN = "https://testnet.layerzeroscan.com/tx/";

export const TransactionStep = ({
  destinationWallet,
  srcAddress,
  exchangeRate,
  srcTokenAmount,
  selectedDstToken,
  selectedSrcToken,
  transactionData,
  handleClose,
  handleRetry,
  setTransactionStatus,
}: Props) => {
  const { isLoading, isError, isSuccess } = useQuery({
    queryKey: ["create-offer", transactionData.txHash],
    queryFn: async () => {
      await axios.get(
        `/api/offer_info?txHash=${transactionData.txHash}&srcEid=${transactionData.srcEid}`,
      );

      await waitForTransactionReceipt(wagmiConfig, {
        chainId: transactionData.srcChainId as any,
        hash: transactionData.txHash as any,
      });

      await axios.post("/api/orders/add", {
        offerId: transactionData.offerId,
        dstSellerAddress: transactionData.dstSellerAddress,
        dstEid: transactionData.dstEid,
        srcTokenAddress: transactionData.srcTokenAddress,
        srcTokenTicker: tokensData[selectedSrcToken].token,
        srcTokenNetwork: tokensData[selectedSrcToken].network,
        dstTokenAddress: transactionData.dstTokenAddress,
        dstTokenTicker: tokensData[selectedDstToken].token,
        dstTokenNetwork: tokensData[selectedDstToken].network,
        srcAmountLD: transactionData.srcAmountLD.toString(),
        exchangeRateSD: transactionData.exchangeRateSD.toString(),
      });
      setTransactionStatus("success");
      return null;
    },
  });

  const buttonHandler = () => (isError ? handleRetry() : handleClose());
  const renderStatusIcon = () => {
    if (isError) {
      return <FileWarning className="size-12" />;
    }
    if (isLoading) {
      return <Clock11 className="size-12 text-white" />;
    }
    if (isSuccess) {
      return <CircleCheck className="size-12" />;
    }
    return null;
  };

  const renderStatusMessage = () => {
    if (isError) {
      return (
        <>
          <span className="mt-5">Ad Acceptance Failed</span>
          <span className="text-gray-700">Please Retry</span>
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <span className="mt-5">Pending Transaction</span>
          <span className="text-gray-700">
            You can already view the transaction in the explorer
          </span>
        </>
      );
    }

    if (isSuccess) {
      return <span className="mt-5">Success</span>;
    }
    return null;
  };

  const renderButtonContent = () => {
    if (isError) {
      return (
        <>
          <Redo2 className="w-5 h-5 mr-2" /> Retry
        </>
      );
    } else if (isLoading) {
      return (
        <>
          <Clock10 className="w-5 h-5 mr-2" /> Processing Transaction
        </>
      );
    } else if (isSuccess) {
      return (
        <>
          <CircleCheck className="w-5 h-5 mr-2" /> Done
        </>
      );
    }
    return null;
  };

  return (
    <div className={"w-full flex flex-col items-center"}>
      <div
        className={
          "w-full h-24 flex flex-col justify-center items-center mt-2 text-xs text-white"
        }
      >
        {renderStatusIcon()}
        {renderStatusMessage()}
      </div>
      <div className={"w-full flex flex-col text-xs mt-5 text-white"}>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>TX ID</span>
          <div
            className={
              "flex flex-row items-center justify-center text-gray-800"
            }
          >
            {addressFormat(transactionData.txHash)}
            <Copy textToCopy={transactionData.txHash} />
            <Link
              href={LAYER_ZERO_SCAN + transactionData.txHash}
              target="_blank"
            >
              <ArrowUpRight
                className={
                  "w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white"
                }
              />
            </Link>
          </div>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Amount to pay</span>
          <span>
            {srcTokenAmount} {tokensData[selectedSrcToken]?.token}
            <span className={"text-gray-700"}>
              ({tokensData[selectedSrcToken]?.network})
            </span>
          </span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>to Wallet</span>
          {destinationWallet.length > 8 && (
            <div className={"flex flex-row items-center text-gray-800"}>
              {addressFormat(destinationWallet)}
              <Copy textToCopy={destinationWallet} />
            </div>
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>from Wallet</span>
          {srcAddress && (
            <div className={"flex flex-row text-gray-800"}>
              {addressFormat(srcAddress as any)}

              <Copy textToCopy={srcAddress as any} />
            </div>
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Amount to recieve</span>
          <span>
            {exchangeRate} {tokensData[selectedDstToken]?.token}
            <span className={"text-gray-700"}>
              ({tokensData[selectedDstToken]?.network})
            </span>
          </span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Exchange Rate</span>
          <span>
            {exchangeRate}{" "}
            <span className={"text-gray-700"}>
              {tokensData[selectedSrcToken]?.token}{" "}
              <span className="text-gray-700">
                ({tokensData[selectedSrcToken]?.network})
              </span>
            </span>{" "}
            = 1{" "}
            <span className={"text-gray-700"}>
              {" "}
              ({tokensData[selectedDstToken]?.network})
            </span>
          </span>
        </div>
      </div>
      <Button
        className="w-full mt-5"
        onClick={buttonHandler}
        variant={
          (isError && "destructive") || (isLoading && "secondary") || "default"
        }
        disabled={isLoading}
      >
        {renderButtonContent()}
      </Button>
    </div>
  );
};
