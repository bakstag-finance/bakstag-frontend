import { Button, Copy, Input, SelectCoin, Skeleton } from "@/components/ui";
import { tokensData } from "@/lib/constants";
import {
  addressFormat,
  isValidTokenAmount,
  isValueOutOfBounds,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { ApprovingStatus } from "@/types/contracts";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface FormStepProps {
  selectedSrcToken: string;
  setSelectedSrcToken: Dispatch<SetStateAction<string>>;
  selectedDstToken: string;
  setSelectedDstToken: Dispatch<SetStateAction<string>>;
  srcTokenAmount: string;
  setSrcTokenAmount: Dispatch<SetStateAction<string>>;
  exchangeRate: string;
  setExchangeRate: Dispatch<SetStateAction<string>>;
  destinationWallet: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  srcAddress: `0x${string}` | undefined;
  isWalletConnected: boolean;
  approvingStatus: ApprovingStatus;
  approvingErrorMessage: string;
  isValidDestinationWallet: boolean;
  isValidTokenAmount: boolean;
  isValidExchangeRate: boolean;
  isDstWalletChange: boolean;
  handleCreateSwap: () => void;
  handleClose: () => void;
}

export const FormStep = ({
  selectedSrcToken,
  setSelectedSrcToken,
  srcTokenAmount,
  setSrcTokenAmount,
  selectedDstToken,
  setSelectedDstToken,
  exchangeRate,
  setExchangeRate,
  destinationWallet,
  handleInputChange: handleDestinationAddress,
  srcAddress,
  isWalletConnected,
  isValidDestinationWallet,
  handleCreateSwap,
  handleClose,
  approvingStatus,
  isDstWalletChange,
  approvingErrorMessage,
}: FormStepProps) => {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => {
    const value = e.target.value;
    setter(value);
  };

  const _totalReceiveAmount =
    Number(srcTokenAmount) * Number(exchangeRate) * 0.99;
  const totalReceiveAmount = new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 14,
    maximumFractionDigits: 14,
  }).format(_totalReceiveAmount);

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

  const buttonDisabled =
    !isWalletConnected ||
    !isValidDestinationWallet ||
    !isCorrectExchangeRate ||
    !isCorrectSrcTokenAmount ||
    approvingStatus === "pending";

  return (
    <div className={"max-w-[320px] w-full flex flex-col text-white"}>
      <div className={"flex flex-row justify-between items-center text-xs"}>
        <div className={"w-full flex flex-col justify-between items-start"}>
          <span className={"text-gray-700"}>Token to Sell </span>
          <SelectCoin
            placeholder={"Token to Sell"}
            className={"mt-2"}
            value={selectedSrcToken}
            setValue={setSelectedSrcToken}
          />
        </div>
        <div
          className={"w-full ml-2 flex flex-col justify-between items-start"}
        >
          <span className={"text-gray-700"}>Amount</span>
          <Input
            className={cn(
              "mt-2 bg-black border rounded-lg border-gray-800",
              !isCorrectSrcTokenAmount &&
                "border-red-700  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
            )}
            value={srcTokenAmount}
            type="text"
            placeholder="0.0"
            onChange={(e) => handleInputChange(e, setSrcTokenAmount)}
          />
        </div>
      </div>
      <div
        className={"flex flex-row justify-between items-center text-xs mt-5"}
      >
        <div className={"w-full flex flex-col justify-between items-start"}>
          <span className={"text-gray-700"}>Token to Recieve </span>
          <SelectCoin
            placeholder={"Token to Recieve"}
            className={"mt-2"}
            value={selectedDstToken}
            setValue={setSelectedDstToken}
          />
        </div>
        <div
          className={"ml-2 w-full flex flex-col justify-between items-start"}
        >
          <span className={" text-gray-700"}>Set Exchange Rate</span>
          <Input
            className={cn(
              "mt-2 bg-black border rounded-lg border-gray-800",
              !isCorrectExchangeRate &&
                "border-red-700  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
            )}
            value={exchangeRate}
            type="text"
            placeholder="0.0"
            onChange={(e) => handleInputChange(e, setExchangeRate)}
          />
        </div>
      </div>
      <div className={"w-full flex flex-col mt-5"}>
        <span className={"text-xs text-gray-700"}>
          Destination Wallet Address
        </span>
        <Input
          className={cn(
            "mt-2 bg-black border rounded-lg border-gray-800",
            !isDstWalletChange
              ? isValidDestinationWallet
                ? "border-gray-800"
                : "border-red-200 focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1"
              : "border-gray-800",
          )}
          value={destinationWallet}
          onChange={(e) => handleDestinationAddress(e)}
        />
      </div>
      <div className={"w-full flex flex-col text-xs mt-5"}>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Locked Amount</span>
          <span>
            {Number(exchangeRate) > 0 && selectedSrcToken.length > 1 ? (
              <span>
                {exchangeRate}{" "}
                <span>
                  {tokensData[selectedSrcToken]?.token}{" "}
                  <span className="text-gray-700">
                    ({tokensData[selectedSrcToken]?.network})
                  </span>
                </span>
              </span>
            ) : (
              <span>N/A</span>
            )}
          </span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>to Wallet</span>
          {destinationWallet.length > 8 ? (
            <div className={"flex flex-row  items-center text-gray-800"}>
              {addressFormat(destinationWallet)}
              <Copy textToCopy={destinationWallet} />
            </div>
          ) : (
            <Skeleton className="w-16 h-4" />
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>from Wallet</span>
          {srcAddress ? (
            <div className={"flex flex-row  items-center text-gray-800"}>
              {addressFormat(srcAddress as any)}
              <Copy textToCopy={srcAddress as any} />
            </div>
          ) : (
            <span className={"text-gray-700"}>Connect Wallet</span>
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Exchange Rate</span>
          {Number(exchangeRate) > 0 && selectedSrcToken.length > 0 ? (
            <span>
              {exchangeRate}{" "}
              <span>
                {tokensData[selectedSrcToken]?.token}{" "}
                <span className="text-gray-700">
                  ({tokensData[selectedSrcToken]?.network})
                </span>
              </span>{" "}
              = 1
              <span className={"text-gray-700"}>
                {" "}
                ({tokensData[selectedDstToken]?.network})
              </span>
            </span>
          ) : (
            <span className={"text-gray-700"}>Set Exchange Rate</span>
          )}
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Protocol Fee</span>
          <span>1%</span>
        </div>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Total Receive amount</span>
          {selectedDstToken !== "" ? (
            Number(srcTokenAmount) > 0 ? (
              <span>
                {totalReceiveAmount}{" "}
                <span className={"ml-2"}>
                  {tokensData[selectedDstToken]?.token}{" "}
                  <span className="text-gray-700">
                    ({tokensData[selectedDstToken]?.network})
                  </span>
                </span>
              </span>
            ) : (
              <span className={"text-gray-700"}>Set Exchange Rate</span>
            )
          ) : (
            <Skeleton className="w-16 h-4" />
          )}
        </div>
      </div>
      <Button
        className={"w-full mt-5"}
        disabled={buttonDisabled}
        onClick={handleCreateSwap}
        variant={
          (approvingStatus === "pending" && "secondary") ||
          (approvingStatus === "error" && "destructive") ||
          "default"
        }
      >
        {getButtonText()}
      </Button>
      <Button
        className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
        onClick={handleClose}
      >
        Cancel
      </Button>
    </div>
  );
};
