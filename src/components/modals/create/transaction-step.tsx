"use client";

import { Button, Copy } from "@/components/ui";
import {
  addressFormat,
  calculateSrcAmountPerOneDst,
  formatNumber,
  getScanLink,
} from "@/lib/helpers";
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
import { getTransactionReceipt, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { ChainIds, Status } from "@/types/contracts";

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

const StatusIcon = ({
  isError,
  isLoading,
  isSuccess,
}: {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}) => {
  if (isError) return <FileWarning className="size-16 stroke-[0.5]" />;
  if (isLoading) return <Clock11 className="size-16 text-white stroke-[0.5]" />;
  if (isSuccess) return <CircleCheck className="size-16 stroke-[0.5]" />;
  return null;
};

const StatusMessage = ({
  isError,
  isLoading,
  isSuccess,
}: {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}) => {
  if (isError) {
    return (
      <>
        <span className="mt-5">Ad Acceptance Failed</span>
        <span className="text-gray-700 mt-2">Please Retry</span>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <span className="mt-5">Pending Transaction</span>
        <span className="text-gray-700 mt-2">
          You can already view the transaction in the explorer
        </span>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <span className="mt-5">Ad Successfully Created & Listed</span>
        <span className="text-gray-700 mt-2">
          might need 2 mins to appear in a list
        </span>
      </>
    );
  }

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
        <Clock10 className="w-5 h-5 mr-2" /> Processing Transaction
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

const calculateTotalReceiveAmount = (
  srcTokenAmount: string,
  exchangeRate: string,
) => {
  return Number(srcTokenAmount) * Number(exchangeRate) * 0.99;
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
      <div className="w-full h-44 flex flex-col justify-center items-center mt-2 text-xs text-white">
        <StatusIcon
          isError={isError}
          isLoading={isLoading}
          isSuccess={isSuccess}
        />
        <StatusMessage
          isError={isError}
          isLoading={isLoading}
          isSuccess={isSuccess}
        />
      </div>

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

interface DetailsProps extends Props {
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
}: DetailsProps) => {
  const link = getScanLink({
    isMonochain,
    srcNetwork,
    txHash: transactionData.txHash,
  });

  const srcAmountPerOneDst = formatNumber(
    calculateSrcAmountPerOneDst(srcTokenAmount, dstTokenAmount),
  );
  return (
    <div className="w-full flex flex-col text-xs mt-5 text-white">
      <TransactionRow label="TX ID">
        <div className="flex flex-row items-center justify-center text-gray-800">
          {addressFormat(transactionData.txHash)}
          <Copy textToCopy={transactionData.txHash} />
          <Link href={link} target="_blank">
            <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
          </Link>
        </div>
      </TransactionRow>

      <TransactionRow label="Amount to sell">
        {srcTokenAmount} {tokensData[selectedSrcToken]?.token}{" "}
        <span className="text-gray-700">
          ({tokensData[selectedSrcToken]?.network})
        </span>
      </TransactionRow>

      <TransactionRow label="to Wallet">
        {destinationWallet.length > 8 && (
          <div className="flex flex-row items-center text-gray-800">
            {addressFormat(destinationWallet)}
            <Copy textToCopy={destinationWallet} />
          </div>
        )}
      </TransactionRow>

      <TransactionRow label="from Wallet">
        {srcAddress && (
          <div className="flex flex-row text-gray-800">
            {addressFormat(srcAddress)}
            <Copy textToCopy={srcAddress} />
          </div>
        )}
      </TransactionRow>

      <TransactionRow label="Exchange Rate">
        {srcAmountPerOneDst} {tokensData[selectedSrcToken]?.token}{" "}
        <span className="text-gray-700">
          ({tokensData[selectedSrcToken]?.network})
        </span>{" "}
        = 1 {tokensData[selectedDstToken]?.token}
        <span className="text-gray-700">
          {" "}
          ({tokensData[selectedDstToken]?.network})
        </span>
      </TransactionRow>

      <TransactionRow label="Protocol Fee">
        <span>1 %</span>
      </TransactionRow>
      <TransactionRow label="Total Receive Amount">
        {formatNumber(
          calculateTotalReceiveAmount(srcTokenAmount, dstTokenAmount),
        )}
      </TransactionRow>
    </div>
  );
};

const TransactionRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    <span>{children}</span>
  </div>
);
