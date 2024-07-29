import { Button, Copy, Input, SelectCoin } from "@/components/ui";
import { tokensData } from "@/lib/constants";
import { addressFormat } from "@/lib/helpers";
import { ApprovingStatus } from "@/types/contracts";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface FormStepProps {
  selectedSrcToken: string;
  setSelectedSrcToken: Dispatch<SetStateAction<string>>;
  selectedDstToken: string;
  setSelectedDstToken: Dispatch<SetStateAction<string>>;
  srcTokenAmount: number;
  setSrcTokenAmount: Dispatch<SetStateAction<number>>;
  exchangeRate: number;
  setExchangeRate: Dispatch<SetStateAction<number>>;
  destinationWallet: string;
  setDestinationWallet: Dispatch<SetStateAction<string>>;
  srcAddress: `0x${string}` | undefined;
  isWalletConnected: boolean;
  isFormValid: boolean;
  approvingStatus: ApprovingStatus;
  approvingErrorMessage: string;
  handleCreateSwap: () => void;
  handleClose: () => void;
}

const inputNumberRegex = /^\d+(\.\d{0,6})?$/;

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
  setDestinationWallet,
  srcAddress,
  isWalletConnected,
  isFormValid,
  handleCreateSwap,
  handleClose,
  approvingStatus,
  approvingErrorMessage
}: FormStepProps) => {
  
  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: number) => void,
  ) => {
    const value = e.target.value;
    if (value === "" || inputNumberRegex.test(value)) {
      setter(Number(value));
    }
  };

  const getButtonText = () => {
    if (!isWalletConnected) return "+ Connect Wallet";
    if (!isFormValid) return "Add Destination Wallet Address";
    if (approvingStatus === "pending") return "Pending Approval";
    if (approvingStatus === "error") return approvingErrorMessage;
    return "Sign & Transact";
  };

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
            className={"mt-2 bg-black border rounded-lg border-gray-800"}
            value={srcTokenAmount}
            type="number"
            step="0.000001"
            min={0.000001}
            onChange={(e) => handleNumberChange(e, setSrcTokenAmount)}
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
            className={"mt-2 bg-black border rounded-lg border-gray-800"}
            value={exchangeRate}
            type="number"
            step="0.000001"
            min={0.000001}
            onChange={(e) => handleNumberChange(e, setExchangeRate)}
          />
        </div>
      </div>
      <div className={"w-full flex flex-col mt-5"}>
        <span className={"text-xs text-gray-700"}>
          Destination Wallet Address | ETH (BASE)
        </span>
        <Input
          className={"mt-2 bg-black border rounded-lg border-gray-800"}
          value={destinationWallet}
          onChange={(e) => setDestinationWallet(e.target.value)}
        />
      </div>
      <div className={"w-full flex flex-col text-xs mt-5"}>
        <div
          className={"w-full flex flex-row justify-between items-center my-2"}
        >
          <span>Locked Amount</span>
          <span>
            {exchangeRate > 0 && selectedSrcToken.length > 1 ? (
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
          {destinationWallet.length > 8 && (
            <div className={"flex flex-row  items-center text-gray-800"}>
              {addressFormat(destinationWallet)}
              <Copy textToCopy={destinationWallet} />
            </div>
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
          {exchangeRate > 0 && selectedSrcToken.length > 0 ? (
            <span>
              {exchangeRate}{" "}
              <span >
                {tokensData[selectedSrcToken]?.token}{" "}
                <span className="text-gray-700">
                  ({tokensData[selectedSrcToken]?.network})
                </span>
              </span>{" "}
              = 1<span className={"text-gray-700"}> ({tokensData[selectedDstToken]?.network})</span>
            </span>
          ) : (
            <span className={"text--gray-700"}>Set Exchange Rate</span>
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
          {srcTokenAmount > 0 ? (
            <span>
              {+srcTokenAmount * +exchangeRate}{" "}
              <span className={"ml-2"}>
                {tokensData[selectedDstToken]?.token}{" "}
                <span className="text-gray-700">
                  ({tokensData[selectedDstToken]?.network})
                </span>
              </span>
            </span>
          ) : (
            <span className={"text-gray-700"}>Set Exchange Rate</span>
          )}
        </div>
      </div>
      <Button
        className={"w-full mt-5"}
        disabled={!isWalletConnected || !isFormValid || approvingStatus === "pending"}
        onClick={handleCreateSwap}
        variant={
          (approvingStatus === "pending" && "secondary") || (approvingStatus === "error" && "destructive") || "default"
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
