import { Button, Copy } from "@/components/ui";
import { addressFormat } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleCheck,
  Clock10,
  Clock11,
  FileWarning,
  Redo2,
} from "lucide-react";
import { ChainIds, Status } from "@/types/contracts";
import { LAYER_ZERO_SCAN } from "@/lib/constants";
import { getTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";

interface Props {
  srcWalletAddress: string;
  destinationWallet: string;
  transactionData: {
    txHash: string;
    offerId: string;
    srcChainId: ChainIds;
    srcEid: string;
    srcTokenAddress: string;
    dstTokenAddress: string;
    srcTokenAmount: string;
    exchangeRate: string;
    srcAmountLD: string;
    srcToken: { network: string; ticker: string };
    dstToken: { network: string; ticker: string };
  };
  handleClose: () => void;
  handleRetry: () => void;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  refetch: () => void;
}

const handleTransaction = async (
  txHash: string,
  srcEid: string,
  offerId: string,
  srcChainId: ChainIds,
  srcAmountLD: string,
  setTransactionStatus: Dispatch<SetStateAction<Status>>,
  isMonochain: boolean,
  refetch: () => void,
) => {
  if (isMonochain) {
    const receipt = await getTransactionReceipt(wagmiConfig, {
      hash: txHash as `0x${string}`,
      chainId: srcChainId as any,
    });

    if (receipt.status == "reverted") {
      throw new Error("Reverted Transaction");
    }
  } else {
    await axios.get(`/api/offer_info?txHash=${txHash}&srcEid=${srcEid}`);
  }

  await axios.post("/api/orders/update", {
    offerId: offerId,
    srcAmountLD: srcAmountLD,
  });
  setTransactionStatus("success");
  await refetch();
  return null;
};

export const TransactionStep = ({
  srcWalletAddress,
  destinationWallet,
  transactionData,
  handleRetry,
  handleClose,
  setTransactionStatus,
  refetch,
}: Props) => {
  const {
    srcToken,
    dstToken,
    srcAmountLD,
    srcEid,
    txHash,
    srcChainId,
    offerId,
  } = transactionData;

  const isMonochain = srcToken.network === dstToken.network;

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["create-offer", txHash],
    queryFn: () =>
      handleTransaction(
        txHash,
        srcEid,
        offerId,
        srcChainId,
        srcAmountLD,
        setTransactionStatus,
        isMonochain,
        refetch,
      ),
  });

  const buttonHandler = () => (isError ? handleRetry() : handleClose());

  return (
    <div className="w-full flex flex-col items-center">
      <StatusDisplay
        isLoading={isLoading}
        isError={isError}
        isSuccess={isSuccess}
      />
      <TransactionDetails
        transactionData={transactionData}
        srcWalletAddress={srcWalletAddress}
        destinationWallet={destinationWallet}
      />
      <ActionButton
        isLoading={isLoading}
        isError={isError}
        isSuccess={isSuccess}
        buttonHandler={buttonHandler}
      />
    </div>
  );
};

const StatusDisplay = ({
  isLoading,
  isError,
  isSuccess,
}: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}) => {
  const renderStatusIcon = () => {
    if (isError) return <FileWarning className="size-12" />;
    if (isLoading) return <Clock11 className="size-12 text-white" />;
    if (isSuccess) return <CircleCheck className="size-12" />;
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

  return (
    <div className="w-full h-24 flex flex-col justify-center items-center mt-2 text-xs text-white">
      {renderStatusIcon()}
      {renderStatusMessage()}
    </div>
  );
};

const TransactionDetails = ({
  transactionData,
  srcWalletAddress,
  destinationWallet,
}: {
  transactionData: Props["transactionData"];
  srcWalletAddress: string;
  destinationWallet: string;
}) => (
  <div className="w-full flex flex-col text-xs mt-5 text-white">
    <DetailRow label="TX ID" value={transactionData.txHash} isLink={true} />
    <DetailRow
      label="Amount to pay"
      value={`${transactionData.srcTokenAmount} ${transactionData.srcToken.ticker}`}
    />
    <DetailRow label="to Wallet" value={destinationWallet} />
    <DetailRow label="from Wallet" value={srcWalletAddress} />
    <DetailRow
      label="Amount to receive"
      value={`${transactionData.exchangeRate} ${transactionData.dstToken.ticker}`}
    />
    <DetailRow
      label="Exchange Rate"
      value={`${transactionData.exchangeRate} ${transactionData.srcToken.ticker} = 1 ${transactionData.dstToken.ticker}`}
    />
  </div>
);

const DetailRow = ({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {isLink ? (
      <div className="flex flex-row items-center justify-center text-gray-800">
        {addressFormat(value)}
        <Copy textToCopy={value} />
        <Link href={LAYER_ZERO_SCAN + value} target="_blank">
          <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
        </Link>
      </div>
    ) : (
      <span>{value}</span>
    )}
  </div>
);

const ActionButton = ({
  isLoading,
  isError,
  isSuccess,
  buttonHandler,
}: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  buttonHandler: () => void;
}) => {
  const renderButtonContent = () => {
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

  return (
    <Button
      className="w-full mt-5 rounded-xl"
      onClick={buttonHandler}
      variant={
        (isError && "destructive") || (isLoading && "secondary") || "default"
      }
    >
      {renderButtonContent()}
    </Button>
  );
};
