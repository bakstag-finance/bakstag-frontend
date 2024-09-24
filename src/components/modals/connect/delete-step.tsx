import { Dispatch, SetStateAction, useState } from "react";
import { Copy, Button, LoadingClock } from "@/components/ui";
import {
  Trash,
  ArrowUpRight,
  Redo2,
  CircleCheck,
  FileWarning,
} from "lucide-react";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { Offer } from "@/types/offer";
import {
  addressFormat,
  getScanLink,
  getTokenField,
  handleContractError,
  hexZeroPadTo32,
} from "@/lib/helpers";
import {
  getTransactionReceipt,
  readContract,
  ReadContractErrorType,
  waitForTransaction,
  writeContract,
  WriteContractErrorType,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { otcMarketAbi, otcMarketAddress } from "@/lib/wagmi/contracts/abi";
import { useAccount, useSwitchChain } from "wagmi";
import axios from "axios";
import { formatUnits } from "viem";
import Link from "next/link";
import { DetailRow } from "@/components/molecules";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { ChainIds } from "@/types/contracts";

type Status =
  | "loading"
  | "idle"
  | "error"
  | "deleting"
  | "deleting-error"
  | "success";
type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  order: Offer;
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

export const DeletingStep = ({ order, setStep, refetch }: Props) => {
  const [txHash, setTxHash] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");

  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();

  const deleteQuery = async () => {
    try {
      const response = await axios.post(`/api/offer/delete`, {
        offerId: order.offerId,
      });

      if (response.status === 200) {
        setStatus("success");
      }
    } catch (e) {
      console.error(e);
      setStatus("deleting-error");
    }
  };

  const executeTransaction = async (args: any, chainId: ChainIds) => {
    try {
      const _txHash = await writeContract(wagmiConfig, {
        abi: otcMarketAbi,
        address: otcMarketAddress,
        functionName: "cancelOffer",
        args,
        value: args[1].nativeFee || BigInt(0),
        chainId,
      }).catch(e => {
        const errorMsg = handleContractError(e as WriteContractErrorType, otcMarketAbi);
        throw new Error(errorMsg);
      });

      setTxHash(_txHash);
      setStatus("loading");

      const data = await waitForTransaction(wagmiConfig, { hash: _txHash });

      if (data.status === "reverted") throw new Error("Reverted transaction");

      const txReceipt = await getTransactionReceipt(wagmiConfig, {
        hash: _txHash,
        chainId,
      });

      if (txReceipt.status === "reverted")
        throw new Error("Reverted Transaction");

      return _txHash;
    } catch (e) {
      console.error(e);
      setStatus("error");
      throw e;
    }
  };

  const processMonochain = async (srcChainId: ChainIds) => {
    const args = [
      order.offerId as `0x${string}`,
      { nativeFee: BigInt(0), lzTokenFee: BigInt(0) },
      "" as `0x${string}`,
    ];

    const _txHash = await executeTransaction(args, srcChainId);

    if (_txHash) {
      setStatus("deleting");
      await deleteQuery();
      refetch();
      setStatus("success");
    }
  };

  const processCrossChain = async (
    srcChainId: ChainIds,
    dstChainId: ChainIds,
  ) => {
    const quoteCancelOffer = await readContract(wagmiConfig, {
      abi: otcMarketAbi,
      address: otcMarketAddress,
      functionName: "quoteCancelOffer",
      args: [order.offerId as `0x${string}`],
      chainId: dstChainId,
    }).catch(e => {
      const errorMsg = handleContractError(e as ReadContractErrorType, otcMarketAbi);
      throw new Error(errorMsg);
    });

    const _srcAddress = hexZeroPadTo32(order.srcSellerAddress as `0x${string}`);
    const _options = Options.newOptions().addExecutorLzReceiveOption(
      quoteCancelOffer!.lzTokenFee,
      quoteCancelOffer!.nativeFee,
    );

    const quoteCancelOfferFee = await readContract(wagmiConfig, {
      abi: otcMarketAbi,
      address: otcMarketAddress,
      functionName: "quoteCancelOfferOrder",
      args: [
        _srcAddress,
        order.offerId as `0x${string}`,
        _options.toHex() as `0x${string}`,
        false,
      ],
      chainId: srcChainId,
    }).catch(e => {
      const errorMsg = handleContractError(e as ReadContractErrorType, otcMarketAbi);
      throw new Error(errorMsg);
    });

    await switchChainAsync({ chainId: srcChainId! });

    const args = [
      order.offerId as `0x${string}`,
      quoteCancelOfferFee!,
      _options.toHex() as `0x${string}`,
    ];

    const _txHash = await executeTransaction(args, srcChainId);

    if (_txHash) {
      const receipt = await axios.get(
        `/api/offer/info?txHash=${_txHash}&srcEid=${order.dstEid}`,
      );
      if (receipt) {
        setStatus("deleting");
        await deleteQuery();
        refetch();
        setStatus("success");
      }
    }
  };

  const deleteHandler = async () => {
    try {
      if (!order.offerId) {
        console.log("No order details");
        return;
      }

      setStatus("loading");

      const isMonochain = order.dstTokenNetwork === order.srcTokenNetwork;
      const dstChainId = getTokenField(
        order.dstTokenTicker,
        order.dstTokenNetwork,
        "chainId",
      );
      const srcChainId = getTokenField(
        order.srcTokenTicker,
        order.srcTokenNetwork,
        "chainId",
      );

      if (isMonochain) {
        await processMonochain(srcChainId);
      } else {
        await processCrossChain(srcChainId, dstChainId);
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const isPending = ["loading", "deleting"].includes(status);
  const isError = ["error", "deleting-error"].includes(status);

  const buttonHandler = () => {
    if (isPending) {
      return null;
    } else if (["idle", "error", "deleting-error"].includes(status)) {
      void deleteHandler();
    } else if (status === "success") {
      setStep("main");
    }
  };

  return (
    <div className="w-full flex flex-col justify-start items-center text-sm text-white">
      <ConfirmationSection status={status} />
      <InfoSection txId={txHash} walletAddress={address || ""} order={order} />
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
  order: Offer;
}

const InfoSection = ({ txId, walletAddress, order }: InfoSectionProps) => {
  const srcTokenDecimals = getTokenField(
    order.srcTokenTicker,
    order.srcTokenNetwork,
    "decimals",
  );
  const formattedSrcAmount = formatNumberWithCommas(
    Number(formatUnits(BigInt(order.srcAmountLD), srcTokenDecimals)),
  );
  const exchangeRate = formatNumberWithCommas(
    Number(formatUnits(BigInt(order.exchangeRateSD), 6)),
  );
  const isMonochain = order.srcTokenNetwork === order.dstTokenNetwork;

  const linkToScan = getScanLink({
    isMonochain,
    srcNetwork: order.srcTokenNetwork,
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
          {formattedSrcAmount} {order.srcTokenTicker}{" "}
          <span className="text-gray-700">({order.srcTokenNetwork})</span>
        </span>
      </DetailRow>
      <DetailRow label="From Wallet">
        <div className="flex flex-row items-center justify-center">
          <span className="text-gray-700">{addressFormat(walletAddress)}</span>
          <Copy textToCopy={walletAddress} />
        </div>
      </DetailRow>
      <DetailRow label="Exchange Rate">
        <span>
          {exchangeRate} {order.dstTokenTicker}{" "}
          <span className="text-gray-700">({order.dstTokenNetwork})</span>
        </span>{" "}
        = 1 {order.srcTokenTicker}{" "}
        <span className="text-gray-700">({order.srcTokenNetwork})</span>
      </DetailRow>
    </div>
  );
};
