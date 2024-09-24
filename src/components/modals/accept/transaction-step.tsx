import { Copy, StatusHeader } from "@/components/ui";
import { addressFormat } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChainIds, Status } from "@/types/contracts";
import { LAYER_ZERO_SCAN } from "@/lib/constants";
import { waitForTransaction } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { useAcceptModal } from "@/components/modals/accept/context";
import { useAccount } from "wagmi";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { DetailRow, ActionButton } from "@/components/molecules";

interface Props {
  handleClose: () => void;
  handleRetry: () => void;
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
    const receipt = await waitForTransaction(wagmiConfig, {
      hash: txHash as `0x${string}`,
      chainId: srcChainId as any,
    });

    if (receipt.status == "reverted") {
      throw new Error("Reverted Transaction");
    }
  } else {
    await axios.get(`/api/offer/info?txHash=${txHash}&srcEid=${srcEid}`);
  }

  await axios.post("/api/offer/update", {
    offerId: offerId,
    srcAmountLD: srcAmountLD,
  });
  setTransactionStatus("success");
  void refetch();
  return null;
};

export const TransactionStep = ({ handleRetry, handleClose }: Props) => {
  const {
    destinationWallet,
    refetch,
    setTransactionStatus,
    infoForTransactionStep,
  } = useAcceptModal();
  const {
    srcToken,
    dstToken,
    srcAmountLD,
    srcEid,
    txHash,
    srcChainId,
    offerId,
  } = infoForTransactionStep;

  const { address } = useAccount();

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
      <StatusHeader
        isError={isError}
        isLoading={isLoading}
        isSuccess={isSuccess}
        errorMessage={{
          title: "Ad Acceptance Failed",
          subtitle: "Please Retry",
        }}
        loadingMessage={{
          title: "Ad Acceptance in progress",
          subtitle: "You can already view the transaction in the explorer",
        }}
        successMessage={{
          title: "Success",
          subtitle: "",
        }}
      />
      <TransactionDetails
        srcWalletAddress={address || ""}
        destinationWallet={destinationWallet}
      />
      <ActionButton
        isLoading={isLoading}
        isError={isError}
        isSuccess={isSuccess}
        handleClick={buttonHandler}
        loadingText={"Processing Transaction"}
      />
    </div>
  );
};

const TransactionDetails = ({
  srcWalletAddress,
  destinationWallet,
}: {
  srcWalletAddress: string;
  destinationWallet: string;
}) => {
  const { infoForTransactionStep: transactionData } = useAcceptModal();
  return (
    <div className={"w-full flex flex-col text-xs mt-5 text-white"}>
      <DetailRow label="TX ID">
        <div className={"flex flex-row items-center justify-center"}>
          {addressFormat(transactionData.txHash)}
          <Copy textToCopy={transactionData.txHash} />
          <Link href={LAYER_ZERO_SCAN + transactionData.txHash} target="_blank">
            <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
          </Link>
        </div>
      </DetailRow>
      <DetailRow label="Amount to pay">
        <span>
          {formatNumberWithCommas(transactionData.srcTokenAmount)}{" "}
          {transactionData.dstToken.ticker}{" "}
          <span className={"text-gray-700"}>
            ({transactionData.dstToken.network})
          </span>
        </span>
      </DetailRow>
      <DetailRow label="to Wallet">
        <div className={"flex flex-row items-center justify-center"}>
          {addressFormat(destinationWallet)}
          <Copy textToCopy={destinationWallet} />
        </div>
      </DetailRow>
      <DetailRow label="from Wallet">
        <div className={"flex flex-row items-center justify-center"}>
          {addressFormat(srcWalletAddress)}
          <Copy textToCopy={srcWalletAddress} />
        </div>
      </DetailRow>
      <DetailRow label="Amount to receive">
        <span>
          {formatNumberWithCommas(transactionData.exchangeRate)}{" "}
          {transactionData.srcToken.ticker}{" "}
          <span className={"text-gray-700"}>
            ({transactionData.srcToken.network})
          </span>
        </span>
      </DetailRow>
      <DetailRow label="Exchange Rate">
        <span>
          {formatNumberWithCommas(transactionData.exchangeRate)}{" "}
          {transactionData.dstToken.ticker}{" "}
          <span className={"text-gray-700"}>
            ({transactionData.dstToken.network})
          </span>{" "}
          = 1 {transactionData.srcToken.ticker}{" "}
          <span className={"text-gray-700"}>
            ({transactionData.srcToken.network})
          </span>
        </span>
      </DetailRow>
    </div>
  );
};
