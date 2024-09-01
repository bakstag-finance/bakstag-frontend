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
  calculateSrcAmountPerOneDst,
  formatNumber,
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
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => setter(e.target.value);

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
        label="Token to Sell"
        selectedToken={selectedSrcToken}
        setSelectedToken={setSelectedSrcToken}
        tokenAmount={srcTokenAmount}
        setTokenAmount={setSrcTokenAmount}
        isValidAmount={isCorrectSrcTokenAmount}
        placeholder="0.0"
        isExchangeRate={false}
      />
      <TokenAmountInput
        label="Token to Receive"
        selectedToken={selectedDstToken}
        setSelectedToken={setSelectedDstToken}
        tokenAmount={dstTokenAmount}
        setTokenAmount={setDstTokenAmount}
        isValidAmount={isCorrectExchangeRate}
        placeholder="Set Exchange Rate"
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
        exchangeRate={dstTokenAmount}
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
  className,
  isExchangeRate = false,
}: {
  label: string;
  selectedToken: string;
  setSelectedToken: Dispatch<SetStateAction<string>>;
  tokenAmount: string;
  setTokenAmount: Dispatch<SetStateAction<string>>;
  isValidAmount: boolean;
  placeholder: string;
  className?: string;
  isExchangeRate: boolean;
}) => (
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
        {isExchangeRate ? "Set Exchange Rate" : "Amount"}
      </span>
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

  const srcAmountPerOneDst = formatNumber(
    calculateSrcAmountPerOneDst(srcTokenAmount, exchangeRate),
  );

  return (
    <div className="w-full flex flex-col text-xs mt-5">
      <SummaryRow label="Locked Amount">
        {exchangeRate.length > 0 && selectedSrcToken ? (
          <span>
            {exchangeRate + " " + tokensData[selectedSrcToken]?.token}{" "}
            <span className={"text-gray-700"}>
              ({tokensData[selectedSrcToken].network})
            </span>
          </span>
        ) : (
          <span className={"text-gray-700"}>N/A</span>
        )}
      </SummaryRow>
      <AddressSummaryRow label="to Wallet" value={destinationWallet} />
      <AddressSummaryRow
        label="from Wallet"
        value={srcAddress ?? "Connect Wallet"}
      />
      <SummaryRow
        label="Exchange Rate"
        // token={selectedDstToken}
      >
        {isShowExchangeRate && selectedSrcToken && selectedDstToken ? (
          <span>
            <span>
              {srcAmountPerOneDst +
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
          </span>
        ) : (
          <span className={"text-gray-700"}>Set Exchange Rate</span>
        )}
      </SummaryRow>
      <SummaryRow label="Protocol Fee">
        <span>1%</span>
      </SummaryRow>
      <SummaryRow label="Total Receive amount">
        {isShowTotalReceiveAmount ? (
          <span>{formatNumber(totalReceiveAmount)}</span>
        ) : (
          <span className={"text-gray-700"}>Set Exchange Rate</span>
        )}
        {/*value={isShowTotalReceiveAmount ? formatNumber(totalReceiveAmount) : ""}*/}
        {/*token={selectedDstToken}*/}
      </SummaryRow>
    </div>
  );
};

const AddressSummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {value?.length > 8 ? (
      <div className="flex flex-row items-center text-gray-800">
        {addressFormat(value)}
        <Copy textToCopy={value} />
      </div>
    ) : (
      <Skeleton className="w-16 h-4" />
    )}
  </div>
);

const SummaryRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {children}
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

const calculateTotalReceiveAmount = (
  srcTokenAmount: string,
  exchangeRate: string,
) => {
  return Number(srcTokenAmount) * Number(exchangeRate) * 0.99;
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
