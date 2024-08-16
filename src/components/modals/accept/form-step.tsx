import { AddressInput, Button, Copy, Input, Skeleton } from "@/components/ui";
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
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement>,
    inputField: "src" | "dst",
  ) => void;
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

  const buttonText = getButtonText(
    isWalletConnected,
    isValidDestinationWallet,
    approvingStatus,
    approvingErrorMessage,
  );

  return (
    <div className="w-full flex flex-col text-white">
      <TokenInput
        label="You Pay"
        token={srcToken}
        amount={srcTokenAmount}
        isCorrectAmount={isCorrectSrcTokenAmount}
        handleInputChange={(e) => handleInputChange(e, "src")}
      />
      <TokenInput
        label="Token to Receive"
        token={dstToken}
        amount={dstTokenAmount}
        isCorrectAmount={isCorrectExchangeRate}
        handleInputChange={(e) => handleInputChange(e, "dst")}
      />
      <WalletAddressInput
        label="Destination Wallet Address"
        walletAddress={destinationWallet}
        setWalletAddress={setDestinationWallet}
      />
      <Summary
        srcToken={srcToken}
        dstToken={dstToken}
        srcTokenAmount={srcTokenAmount}
        dstTokenAmount={dstTokenAmount}
        srcWalletAddress={srcWalletAddress}
        destinationWallet={destinationWallet}
      />
      {srcWalletAddress ? (
        <Button
          className="w-full mt-5"
          disabled={!isValidDestinationWallet}
          variant={getButtonVariant(approvingStatus)}
          onClick={submitHandler}
        >
          {buttonText}
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

const TokenInput = ({
  label,
  token,
  amount,
  isCorrectAmount,
  handleInputChange,
}: {
  label: string;
  token: { ticker: string; network: string };
  amount: string;
  isCorrectAmount: boolean;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-row justify-between items-center text-xs mt-3">
    <div className="flex flex-col justify-between items-start h-full">
      <span className="text-gray-700 h-full">{label}</span>
      <span className="h-full">
        {token.ticker} <span className="text-gray-700">({token.network})</span>
      </span>
    </div>
    <div className="flex flex-col justify-between items-start h-full">
      <span className="ml-2 text-gray-700">Amount</span>
      <Input
        className={cn(
          "mt-2 bg-black border rounded-lg border-gray-800",
          !isCorrectAmount &&
            "border-red-700  focus-visible:ring-red-200 focus-visible:ring-offset-0 focus-visible:ring-1",
        )}
        value={amount}
        type="text"
        placeholder="0.0"
        onChange={handleInputChange}
      />
    </div>
  </div>
);

const WalletAddressInput = ({
  label,
  walletAddress,
  setWalletAddress,
}: {
  label: string;
  walletAddress: string;
  setWalletAddress: Dispatch<SetStateAction<string>>;
}) => (
  <div className="w-full flex flex-col mt-3">
    <span className="text-xs text-gray-700">{label}</span>
    <AddressInput value={walletAddress} setValue={setWalletAddress} />
  </div>
);

const Summary = ({
  srcToken,
  dstToken,
  srcTokenAmount,
  dstTokenAmount,
  srcWalletAddress,
  destinationWallet,
}: {
  srcToken: { ticker: string; network: string };
  dstToken: { ticker: string; network: string };
  srcTokenAmount: string;
  dstTokenAmount: string;
  srcWalletAddress: string;
  destinationWallet: string;
}) => (
  <div className="w-full flex flex-col text-xs mt-3">
    <SummaryRow
      label="Amount to pay"
      value={`${srcTokenAmount} ${srcToken.ticker}`}
      network={srcToken.network}
    />
    <SummaryRow label="to Wallet" value={destinationWallet} isAddress={true} />
    <SummaryRow label="from Wallet" value={srcWalletAddress} isAddress={true} />
    <SummaryRow
      label="Amount to receive"
      value={`${dstTokenAmount} ${dstToken.ticker}`}
      network={dstToken.network}
    />
    <SummaryRow
      label="Exchange Rate"
      value={`${dstTokenAmount} ${dstToken.ticker} = ${srcTokenAmount} ${srcToken.ticker}`}
    />
  </div>
);

const SummaryRow = ({
  label,
  value,
  network,
  isAddress = false,
}: {
  label: string;
  value: string;
  network?: string;
  isAddress?: boolean;
}) => (
  <div className="w-full flex flex-row justify-between items-center my-2">
    <span>{label}</span>
    {isAddress ? (
      value?.length > 8 && isValidCryptoAddress(value) ? (
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
        {network && <span className="text-gray-700"> ({network})</span>}
      </span>
    )}
  </div>
);

const getButtonText = (
  isWalletConnected: boolean,
  isValidDestinationWallet: boolean,
  approvingStatus: string,
  approvingErrorMessage: string,
) => {
  if (!isWalletConnected) return "+ Connect Wallet";
  if (!isValidDestinationWallet) return "Add Destination Wallet Address";
  if (approvingStatus === "pending") return "Pending Approval";
  if (approvingStatus === "error") return approvingErrorMessage;
  return "Sign & Transact";
};

const getButtonVariant = (approvingStatus: string) => {
  if (approvingStatus === "pending") return "secondary";
  if (approvingStatus === "error") return "destructive";
  return "default";
};
