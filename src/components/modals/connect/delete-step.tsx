import Link from "next/link";

import { useAccount, useSwitchChain } from "wagmi";
import { Dispatch, SetStateAction, useState } from "react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

import { DetailRow } from "@/components/molecules";
import { Copy, Button, LoadingClock } from "@/components/ui";
import {
  Trash,
  ArrowUpRight,
  Redo2,
  CircleCheck,
  FileWarning,
} from "lucide-react";

import { Offer } from "@/types/offer";

import { addressFormat, getScanLink, getTokenField } from "@/lib/helpers";
import { formatUnits } from "viem";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { deleteHandler } from "@/lib/contracts/delete";
import { SHARED_SYSTEM_DECIMAL } from "@/lib/constants";

type Status =
  | "loading"
  | "idle"
  | "error"
  | "deleting"
  | "deleting-error"
  | "success";
type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  offer: Offer;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  refetch: () => void;
}

type Variant =
  | "default"
  | "destructive"
  | "secondary"
  | "link"
  | "outline"
  | "ghost"
  | null
  | undefined;

const getButtonVariant = (status: Status): Variant => {
  const statusMapping = {
    idle: "default",
    success: "default",
    error: "destructive",
    "deleting-error": "destructive",
    loading: "secondary",
    deleting: "secondary",
  };
  return (statusMapping[status] as Variant) || "default";
};

export const DeletingStep = ({ offer, setStep, refetch }: Props) => {
  const [txHash, setTxHash] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");

  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();

  const tronWallet = useWallet();
  const isTronConnected = tronWallet.connected;

  const isPending = ["loading", "deleting"].includes(status);
  const isError = ["error", "deleting-error"].includes(status);

  const buttonHandler = () => {
    if (isPending) {
      return null;
    }
    if (["idle", "error", "deleting-error"].includes(status)) {
      void deleteHandler({
        offer,
        refetch,
        setStatus,
        setTxHash,
        isTronConnected,
        switchChainAsync,
      });
      return null;
    }

    if (status === "success") {
      setStep("main");
      return null;
    }
  };

  return (
    <div className="w-full flex flex-col justify-start items-center text-sm text-white">
      <ConfirmationSection status={status} />
      <InfoSection txId={txHash} walletAddress={address || ""} offer={offer} />
      <Button
        className="w-full mt-5 font-light rounded-xl"
        variant={getButtonVariant(status)}
        onClick={buttonHandler}
      >
        {status === "idle" && "Cancel Ad"}
        {isPending && (
          <div className={"flex flex-row items-center justify-center"}>
            <LoadingClock className="w-6 h-6 mr-2" /> Processing Transaction
          </div>
        )}
        {isError && (
          <>
            <Redo2 className="w-5 h-5 mr-2" /> Retry
          </>
        )}
        {status === "success" && (
          <>
            <CircleCheck className="w-5 h-5 mr-2" /> Done
          </>
        )}
      </Button>
    </div>
  );
};

const ConfirmationSection = ({ status }: { status: Status }) => {
  const isError = status === "error" || status === "deleting-error";
  const isSuccess = status === "success";

  return (
    <div className="flex flex-col items-center justify-center h-[200px]">
      {isError ? (
        <FileWarning className="w-20 h-20 stroke-[0.5]" />
      ) : (
        <Trash className="w-20 h-20 stroke-[0.5]" />
      )}
      <span className="text-center mt-2">
        {isError
          ? "Ad Cancellation Failed"
          : isSuccess
            ? "Ad Successfully Cancelled"
            : "Are you sure about canceling this ad?"}
      </span>
      <span className="text-gray-700 text-xs text-center mt-1">
        {isError || isSuccess
          ? "this action is irreversible."
          : "This action is irreversible. Make a confident decision."}
      </span>
    </div>
  );
};

interface InfoSectionProps {
  txId: string;
  walletAddress: string;
  offer: Offer;
}

const InfoSection = ({ txId, walletAddress, offer }: InfoSectionProps) => {
  const srcTokenDecimals = getTokenField(
    offer.srcTokenTicker,
    offer.srcTokenNetwork,
    "decimals",
  );
  const formattedSrcAmount = formatNumberWithCommas(
    Number(formatUnits(BigInt(offer.srcAmountLD), srcTokenDecimals)),
  );
  const exchangeRate = formatNumberWithCommas(
    Number(formatUnits(BigInt(offer.exchangeRateSD), SHARED_SYSTEM_DECIMAL)),
  );

  const isMonochain = offer.srcTokenNetwork === offer.dstTokenNetwork;

  const _walletAddress =
    offer.srcTokenNetwork === "TRON" ? walletAddress : walletAddress;

  const linkToScan = getScanLink({
    isMonochain,
    srcNetwork: offer.srcTokenNetwork,
    txHash: txId,
  });

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <DetailRow label="Cancellation TX ID">
        {txId ? (
          <div className="flex flex-row">
            <span>{addressFormat(txId)}</span>
            <Copy textToCopy={txId} />
            <Link href={linkToScan} target="_blank">
              <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
            </Link>
          </div>
        ) : (
          <span className="text-gray-700">N/A</span>
        )}
      </DetailRow>
      <DetailRow label="Amount to Unlock">
        <span>
          {formattedSrcAmount} {offer.srcTokenTicker}{" "}
          <span className="text-gray-700">({offer.srcTokenNetwork})</span>
        </span>
      </DetailRow>
      <DetailRow label="From Wallet">
        <div className="flex flex-row items-center justify-center">
          <span className="text-gray-700">{addressFormat(_walletAddress)}</span>
          <Copy textToCopy={_walletAddress} />
        </div>
      </DetailRow>
      <DetailRow label="Exchange Rate">
        <span>
          {exchangeRate} {offer.dstTokenTicker}{" "}
          <span className="text-gray-700">({offer.dstTokenNetwork})</span>
        </span>{" "}
        = 1 {offer.srcTokenTicker}{" "}
        <span className="text-gray-700">({offer.srcTokenNetwork})</span>
      </DetailRow>
    </div>
  );
};
