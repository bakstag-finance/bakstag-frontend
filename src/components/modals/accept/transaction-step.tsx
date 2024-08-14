import { Button, Copy } from "@/components/ui";
import { addressFormat } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import axios from "axios";
import {
  ArrowUpRight,
  CircleCheck,
  Clock10,
  Clock11,
  FileWarning,
  Redo2,
} from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

const LAYER_ZERO_SCAN = "https://testnet.layerzeroscan.com/tx/";

interface Props {
  srcWalletAddress: string;
  destinationWallet: string;
  transactionData: {
    txHash: string;
    offerId: string;
    srcChainId: 1 | 11155111 | 84532 | 4002 | 11155420 | 421614 | undefined;
    srcEid: string;
    srcTokenAddress: string;
    dstTokenAddress: string;
    srcTokenAmount: string;
    exchangeRate: string;
    srcAmountLD: string;
    srcToken: {
      network: string;
      ticker: string;
    };
    dstToken: {
      network: string;
      ticker: string;
    };
  };
  handleClose: () => void;
  handleRetry: () => void;
  setTransactionStatus: Dispatch<
    SetStateAction<"idle" | "pending" | "success">
  >;
}

export const TransactionStep = ({
  srcWalletAddress,
  destinationWallet,
  transactionData,
  handleRetry,
  handleClose,
  setTransactionStatus,
}: Props) => {
  const { srcToken, srcTokenAmount } = transactionData;

  const { data, isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ["create-offer", transactionData.txHash],
    queryFn: async () => {
      await axios.get(
        `/api/offer_info?txHash=${transactionData.txHash}&srcEid=${transactionData.srcEid}`,
      );

      // await waitForTransactionReceipt(wagmiConfig, {
      //   chainId: transactionData.srcChainId as any,
      //   hash: transactionData.txHash as `0x${string}`,
      // });

      await axios.post("/api/orders/update", {
        offerId: transactionData.offerId,
        srcAmountLD: transactionData.srcAmountLD,
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
    <>
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
              {srcTokenAmount} {srcToken.ticker}
              <span className={"text-gray-700"}>({srcToken.network})</span>
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
            {srcWalletAddress && (
              <div className={"flex flex-row text-gray-800"}>
                {addressFormat(srcWalletAddress)}

                <Copy textToCopy={srcWalletAddress} />
              </div>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Amount to recieve</span>
            <span>
              {transactionData.exchangeRate} {transactionData.dstToken.ticker}
              <span className={"text-gray-700"}>
                ({transactionData.dstToken.network})
              </span>
            </span>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Exchange Rate</span>
            <span>
              {transactionData.exchangeRate}{" "}
              <span className={"text-gray-700"}>
                {transactionData.srcToken.ticker}
              </span>{" "}
              = 1
              <span className={"text-gray-700"}>
                ({transactionData.dstToken.ticker})
              </span>
            </span>
          </div>
        </div>
        <Button
          className="w-full mt-5"
          onClick={buttonHandler}
          variant={
            (isError && "destructive") ||
            (isLoading && "secondary") ||
            "default"
          }
        >
          {renderButtonContent()}
        </Button>
      </div>
    </>
  );
};
