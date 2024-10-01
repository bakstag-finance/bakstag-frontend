"use client";

import { Copy, StatusHeader } from "@/components/ui";
import {
  addressFormat,
  calculateTotalReceiveAmount,
  getScanLink,
} from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import axios from "axios";
import { tokensData } from "@/lib/constants";
import { waitForTransaction } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { ChainIds, Status } from "@/types/contracts";
import { DetailRow } from "@/components/molecules";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { useCreateModal } from "@/components/modals/create/context";
import { useAccount } from "wagmi";
import { ActionButton } from "@/components/ui/";

interface TransactionData {
  txHash: string;
  srcEid: number;
  srcChainId: undefined | ChainIds;
  offerId: string;
  dstEid: number;
  srcSellerAddress: string;
  dstSellerAddress: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmountLD: bigint;
  exchangeRateSD: bigint;
}

interface Props {
  handleClose: () => void;
  handleRetry: () => void;
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
    const receipt = await waitForTransaction(wagmiConfig, {
      hash: transactionData.txHash as `0x${string}`,
      chainId: transactionData.srcChainId,
    });

    if (receipt.status == "reverted") {
      throw new Error("Reverted Transaction");
    }
  } else {
    await axios.get(
      `/api/offer/info?txHash=${transactionData.txHash}&srcEid=${transactionData.srcEid}`,
    );
  }

  await axios.post("/api/offer/add", {
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

export const TransactionStep = ({
  handleClose,
  handleRetry,
  refetch,
}: Props) => {
  const {
    selectedSrcToken,
    selectedDstToken,
    transactionData,
    setTransactionStatus,
  } = useCreateModal();

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

  const buttonHandler = () => {
    if (isLoading) {
      return null;
    }

    if (isError) {
      handleRetry();
    } else {
      handleClose();
    }
  };

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

      <TransactionDetails isMonochain={isMonochain} srcNetwork={srcNetwork} />

      <ActionButton
        handleClick={buttonHandler}
        isError={isError}
        isLoading={isLoading}
        isSuccess={isSuccess}
        loadingText={"Preparing Your Ad"}
        isCopy={true}
        offerId={transactionData.offerId}
      />
    </div>
  );
};

interface TransactionDetailsProps {
  isMonochain: boolean;
  srcNetwork: string;
}

const TransactionDetails = ({
  isMonochain,
  srcNetwork,
}: TransactionDetailsProps) => {
  const {
    transactionData,
    destinationWallet,
    selectedSrcToken,
    selectedDstToken,
    srcTokenAmount,
    dstTokenAmount,
  } = useCreateModal();

  const { address: srcAddress } = useAccount();

  const link = getScanLink({
    isMonochain,
    srcNetwork,
    txHash: transactionData.txHash,
  });

  const exchangeRate = formatNumberWithCommas(Number(dstTokenAmount));
  const totatReceiveAmount = formatNumberWithCommas(
    calculateTotalReceiveAmount(srcTokenAmount, dstTokenAmount),
  );

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
        {totatReceiveAmount}
        <span>
          {" "}
          {tokensData[selectedDstToken]?.token}{" "}
          <span className={"text-gray-700"}>
            ({tokensData[selectedDstToken]?.network})
          </span>
        </span>
      </DetailRow>
    </div>
  );
};
