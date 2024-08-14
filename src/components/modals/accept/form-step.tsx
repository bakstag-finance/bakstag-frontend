import { Button, Copy, Input, Skeleton } from "@/components/ui";
import {
  addressFormat,
  isValidCryptoAddress,
  isValidTokenAmount,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { WalletConnect } from "../wallet-connect";
import { OrderProps } from "@/types/order";

interface Props {
  approvingStatus: string;
  approvingErrorMessage: string;
  isWalletConnected: boolean;
  srcTokenAmount: string;
  setSrcTokenAmount: Dispatch<SetStateAction<string>>;
  dstTokenAmount: string;
  setDstTokenAmount: Dispatch<SetStateAction<string>>;
  destinationWallet: string;
  setDestinationWallet: Dispatch<SetStateAction<string>>;
  srcWalletAddress: string;
  isValidDestinationWallet: boolean;
  closeModalHandler: () => void;
  submitHandler: () => void;
  order: OrderProps;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FormStep = ({
  approvingStatus,
  isWalletConnected,
  approvingErrorMessage,
  srcTokenAmount,
  dstTokenAmount,
  srcWalletAddress,
  destinationWallet,
  setDestinationWallet,
  isValidDestinationWallet,
  closeModalHandler,
  submitHandler,
  order,
  handleInputChange,
}: Props) => {
  const { srcToken, dstToken } = order;
  const isCorrectSrcTokenAmount = isValidTokenAmount(srcTokenAmount);
  const isCorrectExchangeRate = isValidTokenAmount(dstTokenAmount);

  const getButtonText = () => {
    if (!isWalletConnected) return "+ Connect Wallet";
    if (!isValidDestinationWallet) return "Add Destination Wallet Address";
    if (approvingStatus === "pending") return "Pending Approval";
    if (approvingStatus === "error") return approvingErrorMessage;
    return "Sign & Transact";
  };

  return (
    <div className={"w-full flex flex-col text-white"}>
      <div className={"flex flex-row justify-between items-center text-xs"}>
        <div className={"flex flex-col justify-between items-start h-full"}>
          <span className={"text-gray-700 h-full"}>You Pay</span>
          <span className={"h-full"}>
            {srcToken.ticker}{" "}
            <span className={"text-gray-700"}> ({srcToken.network})</span>
          </span>
        </div>
        <div className={"flex flex-col justify-between items-start"}>
          <span className={"ml-2 text-gray-700"}>Amount</span>
          <Input
            className={cn(
              "mt-2 bg-black border rounded-lg border-gray-800",
              !isCorrectSrcTokenAmount &&
                "border-red-700  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
            )}
            value={srcTokenAmount}
            type="text"
            placeholder="0.0"
            disabled
          />
        </div>
      </div>
      <div
        className={"flex flex-row justify-between items-center mt-3 text-xs"}
      >
        <div className={"flex flex-col justify-between items-start h-full"}>
          <span className={"text-gray-700 h-full"}>Token to Recieve</span>
          <span className={"h-full"}>
            {dstToken.ticker}{" "}
            <span className={"text-gray-700"}> ({dstToken.network})</span>
          </span>
        </div>
        <div className={"flex flex-col justify-between items-start h-full"}>
          <span className={"ml-2 text-gray-700"}>Amount</span>
          <Input
            className={cn(
              "mt-2 bg-black border rounded-lg border-gray-800",
              !isCorrectExchangeRate &&
                "border-red-700  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
            )}
            value={dstTokenAmount}
            type="text"
            placeholder="0.0"
            onChange={(e) => handleInputChange(e)}
          />
        </div>
      </div>
      <div className={"w-full flex flex-col mt-3"}>
        <span className={"text-xs text-gray-700"}>
          Destination Wallet Address
        </span>
        <Input
          className={cn(
            "mt-2 bg-black border rounded-lg ",
            isValidCryptoAddress(destinationWallet)
              ? "border-gray-800"
              : "border-red-200 focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
          )}
          value={destinationWallet}
          onChange={(e) => setDestinationWallet(e.target.value)}
          required
        />
      </div>
      <div className={"w-full flex flex-col text-xs mt-3"}>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Amount to pay</span>
          <span>
            {srcTokenAmount} {srcToken.ticker}
            <span className={"text-gray-700"}> ({srcToken.network})</span>
          </span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>to Wallet</span>
          {destinationWallet?.length > 8 ? (
            <div className={"flex flex-row  items-center text-gray-800"}>
              {addressFormat(destinationWallet)}
              <Copy textToCopy={destinationWallet} />
            </div>
          ) : (
            <Skeleton className={"w-16 h-4"} />
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>from Wallet</span>
          {srcWalletAddress?.length > 8 ? (
            <div className={"flex flex-row  items-center text-gray-800"}>
              {addressFormat(srcWalletAddress)}
              <Copy textToCopy={srcWalletAddress} />
            </div>
          ) : (
            <Skeleton className={"h-4 w-16"} />
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Amount to recieve</span>
          <span>
            {dstTokenAmount} {dstToken.ticker}
            <span className={"text-gray-700"}> ({dstToken.network})</span>
          </span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Exchange Rate</span>
          <span>
            {dstTokenAmount}{" "}
            <span className={"text-gray-700"}>{dstToken.ticker}</span> ={" "}
            {srcTokenAmount}
            <span className={"text-gray-700"}> ({srcToken.ticker})</span>
          </span>
        </div>
      </div>
      {srcWalletAddress ? (
        <Button
          className={"w-full mt-5"}
          disabled={!isValidDestinationWallet}
          variant={
            (approvingStatus === "pending" && "secondary") ||
            (approvingStatus === "error" && "destructive") ||
            "default"
          }
          onClick={submitHandler}
        >
          {getButtonText()}
        </Button>
      ) : (
        <WalletConnect />
      )}
      <Button
        className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
        onClick={closeModalHandler}
      >
        Cancel
      </Button>
    </div>
  );
};
