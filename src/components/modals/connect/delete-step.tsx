import { Dispatch, SetStateAction, useState } from "react";
import { Copy, Button } from "@/components/ui";
import {
  Trash,
  ArrowUpRight,
  Clock10,
  Redo2,
  CircleCheck,
  FileWarning,
} from "lucide-react";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { Order } from "@/types/order";
import { addressFormat, getTokenField, hexZeroPadTo32 } from "@/lib/helpers";
import {
  getTransactionReceipt,
  readContract,
  ReadContractErrorType,
  writeContract,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { otcMarketAbi, otcMarketAddress } from "@/lib/wagmi/contracts/abi";
import { useSwitchChain } from "wagmi";
import axios from "axios";
import { formatUnits } from "viem";

type Status =
  | "loading"
  | "idle"
  | "error"
  | "deleting"
  | "deleting-error"
  | "success";
type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  order: Order;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  refetch: () => void;
}

const getButtonVariant = (status: Status) => {
  switch (status) {
    case "idle":
      return "default";
    case "success":
      return "default";
    case "error":
      return "destructive";
    case "deleting-error":
      return "destructive";
    case "loading":
    case "deleting":
      return "secondary";
    default:
      return "default";
  }
};

export const DeletingStep = ({ order, setStep, refetch }: Props) => {
  const [txHash, setTxHash] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");

  const walletAddress = "0xd015684B421CBED3bCfA19643d01F51Bc72a4503";

  const { switchChainAsync } = useSwitchChain();

  const deleteQuery = async () => {
    try {
      const deleteQuery = await axios.post(`/api/orders/delete`, {
        offerId: order.offerId,
      });

      if (deleteQuery.status === 200) {
        setStatus("success");
      }
    } catch (e) {
      console.log(e);
      setStatus("deleting-error");
    }
  };

  const deleteHandler = async () => {
    try {
      if (order.offerId.length === 0) {
        console.log("No order details");
        return null;
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

      const quoteCancelOffer = await readContract(wagmiConfig, {
        abi: otcMarketAbi,
        address: otcMarketAddress,
        functionName: "quoteCancelOffer",
        args: [order.offerId as `0x${string}`],
        chainId: dstChainId,
      }).catch((e) => {
        const error = e as ReadContractErrorType;
        console.log("Error", error);
      });

      const _srcAddress = hexZeroPadTo32(
        order.srcSellerAddress as `0x${string}`,
      );
      const _options = Options.newOptions().addExecutorLzReceiveOption(
        quoteCancelOffer!.lzTokenFee,
        quoteCancelOffer!.nativeFee,
      );

      const qureCancelOfferFee = await readContract(wagmiConfig, {
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
      }).catch((e) => {
        const error = e as ReadContractErrorType;
        console.log("Error", error);
      });

      await switchChainAsync({
        chainId: srcChainId!,
      });

      const fee = qureCancelOfferFee!.nativeFee;

      const _txHash = await writeContract(wagmiConfig, {
        abi: otcMarketAbi,
        address: otcMarketAddress,
        functionName: "cancelOffer",
        args: [
          order.offerId as `0x${string}`,
          qureCancelOfferFee!,
          _options.toHex() as `0x${string}`,
        ],
        value: fee,
        chainId: srcChainId,
      });

      if (_txHash) {
        setTxHash(_txHash);
        setStatus("loading");

        let queryResult;

        if (isMonochain) {
          const receipt = await getTransactionReceipt(wagmiConfig, {
            hash: txHash as `0x${string}`,
            chainId: srcChainId as any,
          });

          if (receipt.status == "reverted") {
            throw new Error("Reverted Transaction");
          }

          queryResult = receipt;
        } else {
          const receipt = await axios
            .get(`/api/offer_info?txHash=${txHash}&srcEid=${order.dstEid}`)
            .catch((e) => {
              setStatus("error");
              console.log(e);
            });

          queryResult = receipt;
        }

        if (queryResult) {
          setStatus("deleting");

          void deleteQuery();
          void refetch();
        }
      } else {
        throw new Error("No txHash");
      }
    } catch (e) {
      setStatus("error");
      console.log(e);
    }
  };

  const buttonHandler = () => {
    if (status === "idle" || status === "error") {
      deleteHandler();
      return;
    }

    if (status === "deleting-error") {
      setStatus("loading");
      void deleteQuery();
      return;
    }

    if (status === "success") {
      setStep("main");
      return;
    }

    return;
  };

  const isPending = status === "loading" || status === "deleting";
  const isError = status === "error" || status === "deleting-error";

  return (
    <div className="w-full flex flex-col justify-start items-center text-sm text-white">
      <ConfirmationSection status={status} />
      <InfoSection txId={txHash} walletAddress={walletAddress} order={order} />
      <Button
        className="w-full mt-5 font-light rounded-xl"
        variant={getButtonVariant(status)}
        disabled={status === "loading"}
        onClick={buttonHandler}
      >
        {status === "idle" && "Sign & Terminate"}

        {isPending && (
          <>
            <Clock10 className="w-5 h-5 mr-2" /> Processing Transaction
          </>
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
          ? "Ad Termination Failed"
          : isSuccess
            ? "Ad Successfully Terminated"
            : "Are You Sure about Terminating this Ad?"}
      </span>
      <span className="text-gray-700 text-xs text-center mt-1">
        {isError || isSuccess
          ? "this action is irreversible."
          : "This action is irreversible. Make a confident decision."}
      </span>
    </div>
  );
};

const InfoSection = ({
  txId,
  walletAddress,
  order,
}: {
  txId: string;
  walletAddress: string;
  order: Order;
}) => {
  const srcTokenDecimals = getTokenField(
    order.srcTokenTicker,
    order.srcTokenNetwork,
    "decimals",
  );

  const formatedSrcAmount = formatUnits(
    BigInt(order.srcAmountLD),
    srcTokenDecimals,
  );

  const exchangeRate = formatUnits(BigInt(order.exchangeRateSD), 6);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <InfoRow label="Termination TX ID">
        {txId.length > 0 ? (
          <div className={"flex flex-row"}>
            <span>{addressFormat(txId)}</span>
            <Copy textToCopy={txId} />
            <ArrowUpRight className="w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white" />
          </div>
        ) : (
          <span className={"text-gray-700"}>N/A</span>
        )}
      </InfoRow>
      <InfoRow label="Available Amount">
        <span>
          {formatedSrcAmount + " " + order.srcTokenTicker + " "}
          <span className={"text-gray-700"}>({order.srcTokenNetwork})</span>
        </span>
      </InfoRow>
      <InfoRow label="from Wallet">
        <div className={"flex flex-row items-center justify-center"}>
          <span className={"text-gray-700"}>
            {addressFormat(walletAddress)}
          </span>
          <Copy textToCopy={walletAddress} />
        </div>
      </InfoRow>
      <InfoRow label="Exchange Rate">
        <span>
          {exchangeRate + " " + order.dstTokenTicker + " "}
          <span className={"text-gray-700"}>({order.dstTokenNetwork})</span>
        </span>{" "}
        = 1 {order.srcTokenTicker}{" "}
        <span className={"text-gray-700"}>({order.srcTokenNetwork})</span>
      </InfoRow>
    </div>
  );
};

const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mt-5 w-full flex flex-row justify-between items-center">
    <span>{label}</span>
    <span>{children}</span>
  </div>
);
