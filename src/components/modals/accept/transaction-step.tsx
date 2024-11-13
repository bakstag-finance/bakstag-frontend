import { Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import axios from "axios";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Copy, StatusHeader } from "@/components/ui";
import { DetailRow, ActionButton } from "@/components/molecules";

import {
  addressFormat,
  formatNumberWithCommas,
  getScanLink,
} from "@/lib/helpers";

import { ChainIds, Status } from "@/types/contracts";

import { waitForTransaction } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";

import { useAcceptModal } from "@/components/modals/accept/context";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

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
  srcTokenNetwork: string,
  setTransactionStatus: Dispatch<SetStateAction<Status>>,
  isMonochain: boolean,
  refetch: () => void,
) => {
  if (isMonochain) {
    if (srcTokenNetwork === "TRON") {
      const tronWeb = (window as any).tronWeb as any;

      if (!tronWeb) {
        throw new Error("No tronWeb Provided");
      }

      const txStatus = await tronWeb.trx.getTransaction(txHash);

      if (txStatus.ret[0].contractRet != "SUCCESS") {
        setTransactionStatus("error");
        throw new Error("Reverted Transaction");
      }
    } else {
      const receipt = await waitForTransaction(wagmiConfig, {
        hash: txHash as `0x${string}`,
        chainId: srcChainId as any,
      });

      if (receipt.status == "reverted") {
        setTransactionStatus("error");
        throw new Error("Reverted Transaction");
      }
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
  const { refetch, setTransactionStatus, infoForTransactionStep } =
    useAcceptModal();
  const {
    srcTokenNetwork,
    dstTokenNetwork,
    srcAmountLD,
    srcEid,
    txHash,
    srcChainId,
    offerId,
  } = infoForTransactionStep;

  const isMonochain = srcTokenNetwork === dstTokenNetwork;

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["create-offer", txHash],
    queryFn: () =>
      handleTransaction(
        txHash,
        srcEid,
        offerId,
        srcChainId,
        srcAmountLD,
        srcTokenNetwork,
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
      <TransactionDetails />
      <ActionButton
        isLoading={isLoading}
        isError={isError}
        isSuccess={isSuccess}
        handleClick={buttonHandler}
        srcTokenNetwork={srcTokenNetwork}
        loadingText={"Processing Transaction"}
      />
    </div>
  );
};

const TransactionDetails = () => {
  const { infoForTransactionStep, destinationWallet } = useAcceptModal();
  const {
    srcTokenNetwork,
    dstTokenNetwork,
    txHash,
    srcTokenTicker,
    exchangeRate,
    srcTokenAmount,
    dstTokenTicker,
  } = infoForTransactionStep;

  const { address } = useAccount();
  const { address: tronAddress } = useWallet();

  const srcWalletAddress =
    dstTokenNetwork === "TRON" ? tronAddress ?? "" : address ?? "";

  const isMonochain = srcTokenNetwork === dstTokenNetwork;

  const link = getScanLink({
    isMonochain,
    srcNetwork: srcTokenNetwork,
    txHash: txHash,
  });

  return (
    <div className={"w-full flex flex-col text-xs mt-5 text-white"}>
      <DetailRow label="TX ID">
        <div className={"flex flex-row items-center justify-center"}>
          {addressFormat(txHash)}
          <Copy textToCopy={txHash} />
          <Link href={link} target="_blank">
            <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
          </Link>
        </div>
      </DetailRow>
      <DetailRow label="Amount to pay">
        <span>
          {formatNumberWithCommas(srcTokenAmount)} {dstTokenTicker}{" "}
          <span className={"text-gray-700"}>({dstTokenNetwork})</span>
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
          {formatNumberWithCommas(exchangeRate)} {srcTokenTicker}{" "}
          <span className={"text-gray-700"}>({srcTokenNetwork})</span>
        </span>
      </DetailRow>
      <DetailRow label="Exchange Rate">
        <span>
          {formatNumberWithCommas(exchangeRate)} {dstTokenTicker}{" "}
          <span className={"text-gray-700"}>({dstTokenNetwork})</span> = 1{" "}
          {srcTokenTicker}{" "}
          <span className={"text-gray-700"}>({srcTokenNetwork})</span>
        </span>
      </DetailRow>
    </div>
  );
};
