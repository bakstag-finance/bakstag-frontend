"use client";

import { Button, Copy, StatusHeader } from "@/components/ui";
import {
  addressFormat,
  calculateTotalReceiveAmount,
  formatNumber,
  getScanLink,
} from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CircleCheck, Clock10, Redo2 } from "lucide-react";
import axios from "axios";
import { tokensData } from "@/lib/constants";
import { getTransactionReceipt, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { ChainIds, Status } from "@/types/contracts";
import { DetailRow } from "@/components/molecules";

interface TransactionData {
  txHash: string;
  srcEid: number;
  srcChainId: ChainIds;
  offerId: string;
  dstEid: number;
  srcSellerAddress: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  dstSellerAddress: string;
  srcAmountLD: bigint;
  exchangeRateSD: bigint;
}

interface Props {
  destinationWallet: string;
  srcAddress: `0x${string}` | undefined;
  dstTokenAmount: string;
  srcTokenAmount: string;
  selectedSrcToken: string;
  selectedDstToken: string;
  transactionData: TransactionData;
  handleClose: () => void;
  handleRetry: () => void;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  refetch: () => void;
}

const handleTransaction = async (
  transactionData: TransactionData,
  selectedSrcToken: string,
  selectedDstToken: string,
  setTransactionStatus: Dispatch<SetStateAction<Status>>,
  isMonochain: boolean,
  refetch: () => void,
) => {
  if (isMonochain) {
    const receipt = await getTransactionReceipt(wagmiConfig, {
      hash: transactionData.txHash as `0x${string}`,
      chainId: transactionData.srcChainId,
    });

    if (receipt.status == "reverted") {
      throw new Error("Reverted Transaction");
    }
  } else {
    await axios.get(
      `/api/offer_info?txHash=${transactionData.txHash}&srcEid=${transactionData.srcEid}`,
    );
  }

  await waitForTransactionReceipt(wagmiConfig, {
    chainId: transactionData.srcChainId,
    hash: transactionData.txHash as `0x${string}`,
  });

  await axios.post("/api/orders/add", {
    offerId: transactionData.offerId,
    srcSellerAddress: transactionData.srcSellerAddress,
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
  void refetch();
  return null;
};

const ButtonContent = ({
  isError,
  isLoading,
  isSuccess,
}: {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}) => {
  if (isError)
    return (
      <>
        <Redo2 className="w-5 h-5 mr-2" /> Retry
      </>
    );
  if (isLoading)
    return (
      <>
        <Clock10 className="w-5 h-5 mr-2" /> Preparing Your Ad
      </>
    );
  if (isSuccess)
    return (
      <>
        <CircleCheck className="w-5 h-5 mr-2" /> Done
      </>
    );
  return null;
};

export const TransactionStep = ({
  destinationWallet,
  srcAddress,
  dstTokenAmount,
  srcTokenAmount,
  selectedDstToken,
  selectedSrcToken,
  transactionData,
  handleClose,
  handleRetry,
  setTransactionStatus,
  refetch,
}: Props) => {
  const srcNetwork = tokensData[selectedSrcToken].network;
  const dstNetwork = tokensData[selectedDstToken].network;
  const isMonochain = srcNetwork === dstNetwork;

  const { isLoading, isError, isSuccess } = useQuery({
    queryKey: ["create-offer", transactionData.txHash],
    queryFn: () =>
      handleTransaction(
        transactionData,
        selectedSrcToken,
        selectedDstToken,
        setTransactionStatus,
        isMonochain,
        refetch,
      ),
  });

  const buttonHandler = () => (isError ? handleRetry() : handleClose());

  return (
    <div className="w-full flex flex-col items-center">
      <StatusHeader
        isError={isError}
        isSuccess={isSuccess}
        isLoading={isLoading}
        errorMessage={{
          title: "Ad Acceptance Failed",
          subtitle: "Please Retry",
        }}
        loadingMessage={{
          title: "Creating Your Ad",
          subtitle: "You can already view the transaction in the explorer",
        }}
        successMessage={{
          title: "Ad Successfully Created & Listed",
          subtitle: "Might need 2 mins to appear in a list",
        }}
      />

      <TransactionDetails
        transactionData={transactionData}
        destinationWallet={destinationWallet}
        srcAddress={srcAddress}
        srcTokenAmount={srcTokenAmount}
        selectedSrcToken={selectedSrcToken}
        selectedDstToken={selectedDstToken}
        dstTokenAmount={dstTokenAmount}
        handleClose={handleClose}
        handleRetry={handleRetry}
        setTransactionStatus={setTransactionStatus}
        refetch={refetch}
        isMonochain={isMonochain}
        srcNetwork={srcNetwork}
      />

      <Button
        className="w-full mt-5 rounded-xl"
        onClick={buttonHandler}
        variant={
          (isError && "destructive") || (isLoading && "secondary") || "default"
        }
        disabled={isLoading}
      >
        <ButtonContent
          isError={isError}
          isLoading={isLoading}
          isSuccess={isSuccess}
        />
      </Button>
    </div>
  );
};

interface TransactionDetailsProps extends Props {
  isMonochain: boolean;
  srcNetwork: string;
}

const TransactionDetails = ({
  transactionData,
  destinationWallet,
  srcAddress,
  srcTokenAmount,
  selectedSrcToken,
  selectedDstToken,
  dstTokenAmount,
  isMonochain,
  srcNetwork,
}: TransactionDetailsProps) => {
  const link = getScanLink({
    isMonochain,
    srcNetwork,
    txHash: transactionData.txHash,
  });

  const exchangeRate = formatNumber(Number(dstTokenAmount));
  return (
    <div className="w-full flex flex-col text-xs mt-5 text-white">
      <DetailRow label="TX ID">
        <div className="flex flex-row items-center justify-center text-gray-800">
          {addressFormat(transactionData.txHash)}
          <Copy textToCopy={transactionData.txHash} />
          <Link href={link} target="_blank">
            <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
          </Link>
        </div>
      </DetailRow>

      <DetailRow label="Locked amount">
        {srcTokenAmount} {tokensData[selectedSrcToken]?.token}{" "}
        <span className="text-gray-700">
          ({tokensData[selectedSrcToken]?.network})
        </span>
      </DetailRow>

      <DetailRow label="to Wallet">
        {destinationWallet.length > 8 && (
          <div className="flex flex-row items-center text-gray-800">
            {addressFormat(destinationWallet)}
            <Copy textToCopy={destinationWallet} />
          </div>
        )}
      </DetailRow>

      <DetailRow label="from Wallet">
        {srcAddress && (
          <div className="flex flex-row text-gray-800">
            {addressFormat(srcAddress)}
            <Copy textToCopy={srcAddress} />
          </div>
        )}
      </DetailRow>

      <DetailRow label="Exchange Rate">
        {exchangeRate} {tokensData[selectedSrcToken]?.token}{" "}
        <span className="text-gray-700">
          ({tokensData[selectedSrcToken]?.network})
        </span>{" "}
        = 1 {tokensData[selectedDstToken]?.token}
        <span className="text-gray-700">
          {" "}
          ({tokensData[selectedDstToken]?.network})
        </span>
      </DetailRow>

      <DetailRow label="Protocol Fee">
        <span>1 %</span>
      </DetailRow>
      <DetailRow label="Total Receive Amount">
        {calculateTotalReceiveAmount(srcTokenAmount, dstTokenAmount)}
        <span>
          {" "}
          {tokensData[selectedDstToken]?.network}{" "}
          <span className={"text-gray-700"}>
            ({tokensData[selectedDstToken]?.network})
          </span>
        </span>
      </DetailRow>
    </div>
  );
};
