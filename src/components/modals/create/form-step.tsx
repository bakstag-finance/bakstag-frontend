import { AddressInput, Button, SelectCoin, TokenInput } from "@/components/ui";
import { tokensData } from "@/lib/constants";
import {
  calculateTotalReceiveAmount,
  validateTokenAmount,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Status } from "@/types/contracts";
import { Dispatch, SetStateAction } from "react";
import { WalletConnect } from "@/components/modals/wallet-connect";
import { AddressDetailRow, DetailRow } from "@/components/molecules";
import { formatNumberWithCommas } from "@/lib/helpers/formating";

interface FormStepProps {
  selectedSrcToken: string;
  setSelectedSrcToken: Dispatch<SetStateAction<string>>;
  selectedDstToken: string;
  setSelectedDstToken: Dispatch<SetStateAction<string>>;
  srcTokenAmount: string;
  setSrcTokenAmount: Dispatch<SetStateAction<string>>;
  dstTokenAmount: string;
  setDstTokenAmount: Dispatch<SetStateAction<string>>;
  destinationWallet: string;
  setDestinationWallet: Dispatch<SetStateAction<string>>;
  srcAddress: `0x${string}` | undefined;
  isWalletConnected: boolean;
  approvingStatus: Status;
  approvingErrorMessage: string;
  isValidDestinationWallet: boolean;
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
  dstTokenAmount,
  setDstTokenAmount,
  destinationWallet,
  setDestinationWallet,
  srcAddress,
  isWalletConnected,
  isValidDestinationWallet,
  handleCreateSwap,
  handleClose,
  approvingStatus,
  approvingErrorMessage,
}: FormStepProps) => {
  const totalReceiveAmount = calculateTotalReceiveAmount(
    srcTokenAmount,
    dstTokenAmount,
  );

  const isCorrectSrcTokenAmount = validateTokenAmount(srcTokenAmount);
  const isCorrectExchangeRate = validateTokenAmount(dstTokenAmount);

  const buttonDisabled = checkButtonDisabled(
    isWalletConnected,
    isValidDestinationWallet,
    isCorrectExchangeRate,
    isCorrectSrcTokenAmount,
    approvingStatus,
  );

  return (
    <div className="max-w-[320px] w-full flex flex-col text-white">
      <TokenAmountInput
        label="You sell"
        selectedToken={selectedSrcToken}
        setSelectedToken={setSelectedSrcToken}
        tokenAmount={srcTokenAmount}
        setTokenAmount={setSrcTokenAmount}
        placeholder="0"
        isExchangeRate={false}
      />
      <TokenAmountInput
        label="You Receive"
        selectedToken={selectedDstToken}
        setSelectedToken={setSelectedDstToken}
        tokenAmount={dstTokenAmount}
        setTokenAmount={setDstTokenAmount}
        placeholder="0"
        className={"mt-5"}
        isExchangeRate={true}
      />
      <WalletAddressInput
        label="Destination Wallet Address"
        value={destinationWallet}
        setValue={setDestinationWallet}
      />
      <Summary
        selectedSrcToken={selectedSrcToken}
        srcTokenAmount={srcTokenAmount}
        selectedDstToken={selectedDstToken}
        exchangeRate={dstTokenAmount.toString()}
        destinationWallet={destinationWallet}
        srcAddress={srcAddress}
        totalReceiveAmount={totalReceiveAmount}
      />
      <ActionButton
        buttonDisabled={buttonDisabled}
        approvingStatus={approvingStatus}
        approvingErrorMessage={approvingErrorMessage}
        handleCreateSwap={handleCreateSwap}
        handleClose={handleClose}
        isWalletConnected={isWalletConnected}
      />
    </div>
  );
};

const TokenAmountInput = ({
  label,
  selectedToken,
  setSelectedToken,
  tokenAmount,
  setTokenAmount,
  placeholder,
  className,
  isExchangeRate = false,
}: {
  label: string;
  selectedToken: string;
  setSelectedToken: Dispatch<SetStateAction<string>>;
  tokenAmount: string;
  setTokenAmount: Dispatch<SetStateAction<string>>;
  placeholder: string;
  className?: string;
  isExchangeRate: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex flex-row justify-between items-center text-xs",
        className,
      )}
    >
      <div className="w-full flex flex-col justify-between items-start">
        <span className="text-gray-700 ml-3">{label}</span>
        <SelectCoin
          placeholder={label}
          className="mt-2"
          value={selectedToken}
          setValue={setSelectedToken}
        />
      </div>
      <div className="ml-2 w-full flex flex-col justify-between items-start">
        <span className="text-gray-700 ml-3">
          {isExchangeRate ? "Set Exchange Rate" : "Amount to sell"}
        </span>
        <TokenInput
          value={tokenAmount}
          setValue={setTokenAmount}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

const WalletAddressInput = ({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}) => (
  <div className="w-full flex flex-col mt-5">
    <span className="text-xs text-gray-700 ml-3">{label}</span>
    <AddressInput value={value} setValue={setValue} />
  </div>
);

const Summary = ({
  selectedSrcToken,
  srcTokenAmount,
  selectedDstToken,
  exchangeRate,
  destinationWallet,
  srcAddress,
  totalReceiveAmount,
}: {
  selectedSrcToken: string;
  srcTokenAmount: string;
  selectedDstToken: string;
  exchangeRate: string;
  destinationWallet: string;
  srcAddress: `0x${string}` | undefined;
  totalReceiveAmount: number;
}) => {
  const isShowExchangeRate =
    selectedDstToken && selectedSrcToken && exchangeRate && srcTokenAmount;

  const isShowTotalReceiveAmount = exchangeRate && selectedDstToken;

  return (
    <div className="w-full flex flex-col text-xs mt-5">
      <DetailRow label="Locked Amount">
        {exchangeRate.length > 0 && selectedSrcToken ? (
          <span>
            {srcTokenAmount + " " + tokensData[selectedSrcToken]?.token}{" "}
            <span className={"text-gray-700"}>
              ({tokensData[selectedSrcToken].network})
            </span>
          </span>
        ) : (
          <span className={"text-gray-700"}>N/A</span>
        )}
      </DetailRow>
      <AddressDetailRow label="to Wallet" value={destinationWallet} />
      <AddressDetailRow label="from Wallet" value={srcAddress || ""} />
      <DetailRow label="Exchange Rate">
        {isShowExchangeRate && selectedSrcToken && selectedDstToken ? (
          <>
            <span>
              {formatNumberWithCommas(Number(exchangeRate)) +
                " " +
                tokensData[selectedDstToken].token +
                " "}
              <span className={"text-gray-700"}>
                ({tokensData[selectedDstToken].network})
              </span>
            </span>{" "}
            = 1 <span>{tokensData[selectedSrcToken].token}</span>{" "}
            <span className={"text-gray-700"}>
              ({tokensData[selectedSrcToken].network})
            </span>
          </>
        ) : (
          <span className={"text-gray-700"}>Set Exchange Rate</span>
        )}
      </DetailRow>
      <DetailRow label="Protocol Fee">
        <span>1%</span>
      </DetailRow>
      <DetailRow label="Total Receive amount">
        {isShowTotalReceiveAmount ? (
          <span className={"max-w-full "}>
            {formatNumberWithCommas(totalReceiveAmount) + " "}
            <span>
              {tokensData[selectedDstToken].token}{" "}
              <span className={"text-gray-700"}>
                ({tokensData[selectedDstToken].network})
              </span>
            </span>
          </span>
        ) : (
          <span className={"text-gray-700"}>Set Exchange Rate</span>
        )}
      </DetailRow>
    </div>
  );
};

const ActionButton = ({
  buttonDisabled,
  approvingStatus,
  approvingErrorMessage,
  handleCreateSwap,
  handleClose,
  isWalletConnected,
}: {
  buttonDisabled: boolean;
  approvingStatus: Status;
  approvingErrorMessage: string;
  handleCreateSwap: () => void;
  handleClose: () => void;
  isWalletConnected: boolean;
}) => {
  if (!isWalletConnected) {
    return <WalletConnect />;
  }

  return (
    <>
      <Button
        className="w-full mt-5 rounded-xl"
        disabled={buttonDisabled}
        onClick={handleCreateSwap}
        variant={
          (approvingStatus === "pending" && "secondary") ||
          (approvingStatus === "error" && "destructive") ||
          "default"
        }
      >
        {getButtonText(approvingStatus, approvingErrorMessage)}
      </Button>
      <Button
        className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800 rounded-xl"
        onClick={handleClose}
      >
        Cancel
      </Button>
    </>
  );
};

const getButtonText = (
  approvingStatus: Status,
  approvingErrorMessage: string,
) => {
  if (approvingStatus === "pending") return "Pending Confirmation";
  if (approvingStatus === "error") return approvingErrorMessage;
  return "Publish Ad";
};

const checkButtonDisabled = (
  isWalletConnected: boolean,
  isValidDestinationWallet: boolean,
  isCorrectExchangeRate: boolean,
  isCorrectSrcTokenAmount: boolean,
  approvingStatus: Status,
) => {
  return (
    !isWalletConnected ||
    !isValidDestinationWallet ||
    !isCorrectExchangeRate ||
    !isCorrectSrcTokenAmount ||
    approvingStatus === "pending"
  );
};
