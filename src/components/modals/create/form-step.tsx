import {
  AddressInput,
  Button,
  Copy,
  Input,
  SelectCoin,
  Skeleton,
} from "@/components/ui";
import { tokensData } from "@/lib/constants";
import {
  addressFormat,
  isValidTokenAmount,
  isValueOutOfBounds,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Status } from "@/types/contracts";
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
  exchangeRate,
  setExchangeRate,
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
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => setter(e.target.value);

  const totalReceiveAmount = calculateTotalReceiveAmount(
    srcTokenAmount,
    exchangeRate,
  );

  const isCorrectSrcTokenAmount = validateTokenAmount(srcTokenAmount);
  const isCorrectExchangeRate = validateTokenAmount(exchangeRate);

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
        label="Token to Sell"
        selectedToken={selectedSrcToken}
        setSelectedToken={setSelectedSrcToken}
        tokenAmount={srcTokenAmount}
        setTokenAmount={setSrcTokenAmount}
        isValidAmount={isCorrectSrcTokenAmount}
        placeholder="0.0"
      />
      <TokenAmountInput
        label="Token to Receive"
        selectedToken={selectedDstToken}
        setSelectedToken={setSelectedDstToken}
        tokenAmount={exchangeRate}
        setTokenAmount={setExchangeRate}
        isValidAmount={isCorrectExchangeRate}
        placeholder="Set Exchange Rate"
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
        exchangeRate={exchangeRate}
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
  isValidAmount,
  placeholder,
}: {
  label: string;
  selectedToken: string;
  setSelectedToken: Dispatch<SetStateAction<string>>;
  tokenAmount: string;
  setTokenAmount: Dispatch<SetStateAction<string>>;
  isValidAmount: boolean;
  placeholder: string;
}) => (
  <div className="flex flex-row justify-between items-center text-xs">
    <div className="w-full flex flex-col justify-between items-start">
      <span className="text-gray-700">{label}</span>
      <SelectCoin
        placeholder={label}
        className="mt-2"
        value={selectedToken}
        setValue={setSelectedToken}
      />
    </div>
    <div className="ml-2 w-full flex flex-col justify-between items-start">
      <span className="text-gray-700">Amount</span>
      <Input
        className={cn(
          "mt-2 bg-black border rounded-lg border-gray-800",
          !isValidAmount &&
            "border-red-700 focus-visible:ring-red-200 focus-visible:ring-1",
        )}
        value={tokenAmount}
        type="text"
        placeholder={placeholder}
        onChange={(e) => setTokenAmount(e.target.value)}
      />
    </div>
  </div>
);

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
    <span className="text-xs text-gray-700">{label}</span>
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
  totalReceiveAmount: string;
}) => (
  <div className="w-full flex flex-col text-xs mt-5">
    <SummaryRow
      label="Locked Amount"
      value={exchangeRate}
      token={selectedSrcToken}
    />
    <SummaryRow label="to Wallet" value={destinationWallet} isAddress={true} />
    <SummaryRow
      label="from Wallet"
      value={srcAddress ?? "Connect Wallet"}
      isAddress={true}
    />
    <SummaryRow
      label="Exchange Rate"
      value={`${exchangeRate} = 1`}
      token={selectedDstToken}
    />
    <SummaryRow label="Protocol Fee" value="1%" />
    <SummaryRow
      label="Total Receive amount"
      value={totalReceiveAmount}
      token={selectedDstToken}
    />
  </div>
);

const SummaryRow = ({
  label,
  value,
  token,
  isAddress = false,
}: {
  label: string;
  value: string;
  token?: string;
  isAddress?: boolean;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {isAddress ? (
      value?.length > 8 ? (
        <div className="flex flex-row items-center text-gray-800">
          {addressFormat(value)}
          <Copy textToCopy={value} />
        </div>
      ) : (
        <Skeleton className="w-16 h-4" />
      )
    ) : (
      <span>
        {value}
        {token && (
          <span className="text-gray-700"> ({tokensData[token]?.network})</span>
        )}
      </span>
    )}
  </div>
);

const ActionButton = ({
  buttonDisabled,
  approvingStatus,
  approvingErrorMessage,
  handleCreateSwap,
  handleClose,
}: {
  buttonDisabled: boolean;
  approvingStatus: Status;
  approvingErrorMessage: string;
  handleCreateSwap: () => void;
  handleClose: () => void;
}) => (
  <>
    <Button
      className="w-full mt-5"
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
      className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
      onClick={handleClose}
    >
      Cancel
    </Button>
  </>
);

const calculateTotalReceiveAmount = (
  srcTokenAmount: string,
  exchangeRate: string,
) => {
  const _totalReceiveAmount =
    Number(srcTokenAmount) * Number(exchangeRate) * 0.99;
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 14,
    maximumFractionDigits: 14,
  }).format(_totalReceiveAmount);
};

const validateTokenAmount = (amount: string) =>
  isValidTokenAmount(amount) && !isValueOutOfBounds(amount);

const getButtonText = (
  approvingStatus: Status,
  approvingErrorMessage: string,
) => {
  if (approvingStatus === "pending") return "Pending Approval";
  if (approvingStatus === "error") return approvingErrorMessage;
  return "Sign & Transact";
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
