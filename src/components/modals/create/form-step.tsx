import {
  AddressInput,
  Button,
  SelectCoin,
  Skeleton,
  TokenInput,
} from "@/components/ui";
import { tokensData } from "@/lib/constants";
import {
  calculateTotalReceiveAmount,
  isValidCryptoAddress,
  validateTokenAmount,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { AddressDetailRow, DetailRow } from "@/components/molecules";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { useCreateModal } from "@/components/modals/create/context";
import { useAccount } from "wagmi";
import { ActionButton } from "@/components/ui";
import { Squircle } from "@squircle-js/react";

interface FormStepProps {
  handleCreateSwap: () => void;
  handleClose: () => void;
}

export const FormStep = ({ handleCreateSwap, handleClose }: FormStepProps) => {
  const {
    srcTokenAmount,
    dstTokenAmount,
    setDstTokenAmount,
    setSrcTokenAmount,
    destinationWallet,
    setDestinationWallet,
    selectedSrcToken,
    setSelectedSrcToken,
    selectedDstToken,
    setSelectedDstToken,
    approvingStatus,
    approvingErrorMsg,
  } = useCreateModal();

  const { address } = useAccount();

  const isValidDestinationWallet = isValidCryptoAddress(destinationWallet);

  const totalReceiveAmount = calculateTotalReceiveAmount(
    srcTokenAmount,
    dstTokenAmount,
  );

  const isCorrectSrcTokenAmount = validateTokenAmount(srcTokenAmount);
  const isCorrectExchangeRate = validateTokenAmount(dstTokenAmount);

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
        isExchangeRate={true}
        selectedDstToken={selectedDstToken}
        selectedSrcToken={selectedSrcToken}
        className={"mt-5"}
      />
      <AddressInput
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
        srcAddress={address}
        totalReceiveAmount={totalReceiveAmount}
      />
      <ActionButton
        approvingStatus={approvingStatus}
        approvingErrorMsg={approvingErrorMsg}
        handleClose={handleClose}
        handleClick={handleCreateSwap}
        btnDisabled={
          !isValidDestinationWallet ||
          !isCorrectExchangeRate ||
          !isCorrectSrcTokenAmount
        }
        defaultText={"Publish Ad"}
        isValidDestinationWallet={isValidDestinationWallet}
        isValidTokensInput={isCorrectSrcTokenAmount && isCorrectExchangeRate}
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
  selectedDstToken,
  selectedSrcToken,
}: {
  label: string;
  selectedToken: string;
  setSelectedToken: Dispatch<SetStateAction<string>>;
  tokenAmount: string;
  setTokenAmount: Dispatch<SetStateAction<string>>;
  placeholder: string;
  className?: string;
  isExchangeRate: boolean;
  selectedSrcToken?: string;
  selectedDstToken?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-between items-center text-xs",
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
      <div className="mt-5 w-full flex flex-col justify-between items-start">
        <span className={"text-gray-700 ml-3"}>
          {isExchangeRate ? "Exchange Rate" : "Amount to sell"}
        </span>
        <div className={cn("flex justify-center items-center w-full")}>
          <TokenInput
            value={tokenAmount}
            setValue={setTokenAmount}
            placeholder={placeholder}
            className={isExchangeRate ? "w-1/2 float-right" : ""}
          />
          {isExchangeRate ? (
            selectedSrcToken && selectedDstToken ? (
              <span
                className={
                  "w-full h-full ml-3 mt-2 text-white flex flex-row justify-start items-center"
                }
              >
                <span className={"text-[14px] font-light"}>
                  {tokensData[selectedDstToken].token + " "}
                  <span className={"text-gray-700"}>
                    ({tokensData[selectedDstToken].network}){" "}
                  </span>{" "}
                  = 1 <span>{tokensData[selectedSrcToken].token}</span>{" "}
                  <span className={"text-gray-700"}>
                    {" "}
                    ({tokensData[selectedSrcToken].network})
                  </span>
                </span>
              </span>
            ) : (
              <Skeleton className={"ml-3 h-10 w-full mt-2 rounded-xl"} />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

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
