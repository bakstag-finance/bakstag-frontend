import { Button, Copy, Input, Skeleton } from "@/components/ui";
import {
  addressFormat,
  isValidCryptoAddress,
  isValidTokenAmount,
  isValueOutOfBounds,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { WalletConnect } from "../wallet-connect";

interface Props {
  approvingStatus: string;
  approvingErrorMessage: string;
  isWalletConnected: boolean;
  srcTokenAmount: string;
  setSrcTokenAmount: Dispatch<SetStateAction<string>>;
  exchangeRate: string;
  setExchangeRate: Dispatch<SetStateAction<string>>;
  destinationWallet: string;
  setDestinationWallet: Dispatch<SetStateAction<string>>;
  srcWalletAddress: string;
  isValidDestinationWallet: boolean;
  closeModalHandler: () => void;
  submitHandler: () => void;
}

export const FormStep = ({
  approvingStatus,
  isWalletConnected,
  approvingErrorMessage,
  srcTokenAmount,
  setSrcTokenAmount,
  exchangeRate,
  setExchangeRate,
  srcWalletAddress,
  destinationWallet,
  setDestinationWallet,
  isValidDestinationWallet,
  closeModalHandler,
  submitHandler,
}: Props) => {
  const isCorrectSrcTokenAmount =
    isValidTokenAmount(srcTokenAmount) && !isValueOutOfBounds(srcTokenAmount);
  const isCorrectExchangeRate =
    isValidTokenAmount(exchangeRate) && !isValueOutOfBounds(exchangeRate);

  const getButtonText = () => {
    if (!isWalletConnected) return "+ Connect Wallet";
    if (!isValidDestinationWallet) return "Add Destination Wallet Address";
    if (!isCorrectSrcTokenAmount) return "Incorrect token amount";
    if (!isCorrectExchangeRate) return "Incorrect exchange amount";
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
            SOL <span className={"text-gray-700"}>(SOL)</span>
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
            onChange={(e) => setSrcTokenAmount(e.target.value)}
          />
        </div>
      </div>
      <div
        className={"flex flex-row justify-between items-center mt-3 text-xs"}
      >
        <div className={"flex flex-col justify-between items-start h-full"}>
          <span className={"text-gray-700 h-full"}>Token to Recieve</span>
          <span className={"h-full"}>
            ETH <span className={"text-gray-700"}>(BASE)</span>
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
            value={exchangeRate}
            type="text"
            placeholder="0.0"
            onChange={(e) => setExchangeRate(e.target.value)}
          />
        </div>
      </div>
      <div className={"w-full flex flex-col mt-3"}>
        <span className={"text-xs text-gray-700"}>
          Destination Wallet Address | ETH (BASE)
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
            214.5 SOL
            <span className={"text-gray-700"}>(SOL)</span>
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
            10 ETH
            <span className={"text-gray-700"}>(BASE)</span>
          </span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Exchange Rate</span>
          <span>
            22.154 <span className={"text-gray-700"}>SOL</span> = 1
            <span className={"text-gray-700"}>(ETH)</span>
          </span>
        </div>
      </div>
      {srcWalletAddress ? (
        <Button
          className={"w-full mt-5"}
          disabled={!isValidDestinationWallet}
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
