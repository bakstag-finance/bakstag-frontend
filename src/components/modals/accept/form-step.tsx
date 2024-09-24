import { AddressInput, TokenInput } from "@/components/ui";
import { isValidCryptoAddress, isValidTokenAmount } from "@/lib/helpers";
import { formatUnits } from "viem";
import { useAcceptModal } from "./context";
import { useAccount } from "wagmi";
import { AddressDetailRow, DetailRow } from "@/components/molecules";
import { ActionButton } from "@/components/ui/";
import { formatNumberWithCommas } from "@/lib/helpers/formating";

interface Props {
  closeModalHandler: () => void;
  submitHandler: () => void;
  handleInputChange: (value: string, inputField: "src" | "dst") => void;
}

export const FormStep = ({
  closeModalHandler,
  submitHandler,
  handleInputChange,
}: Props) => {
  const {
    order,
    approvingStatus,
    approvingErrorMsg,
    srcTokenAmount,
    dstTokenAmount,
    destinationWallet,
    setDestinationWallet,
  } = useAcceptModal();

  const { srcToken, dstToken } = order;

  const isCorrectSrcTokenAmount = isValidTokenAmount(srcTokenAmount);
  const isCorrectExchangeRate = isValidTokenAmount(dstTokenAmount);

  const { address } = useAccount();

  const isValidDestinationWallet = isValidCryptoAddress(destinationWallet);

  return (
    <div className="w-full flex flex-col text-white">
      <TokenAmountInput
        label="You Pay"
        token={dstToken}
        amount={srcTokenAmount}
        inputLabel={"Amount to pay"}
        isCorrectAmount={isCorrectSrcTokenAmount}
        handleInputChange={(e) => handleInputChange(e, "src")}
      />
      <TokenAmountInput
        label="You receive"
        token={srcToken}
        amount={dstTokenAmount}
        inputLabel={"Amount to receive"}
        isCorrectAmount={isCorrectExchangeRate}
        handleInputChange={(e) => handleInputChange(e, "dst")}
      />
      <AddressInput
        label={`Destination Wallet Address | ${srcToken.ticker} (${srcToken.network})`}
        value={destinationWallet}
        setValue={setDestinationWallet}
      />
      <Summary
        srcToken={srcToken}
        dstToken={dstToken}
        srcTokenAmount={srcTokenAmount}
        dstTokenAmount={dstTokenAmount}
        address={address || ""}
        destinationWallet={destinationWallet}
        exchangeRate={order.exchangeRateSD}
      />
      <ActionButton
        handleClick={submitHandler}
        handleClose={closeModalHandler}
        approvingStatus={approvingStatus}
        approvingErrorMsg={approvingErrorMsg}
        defaultText={"Accept Ad"}
        btnDisabled={
          !isValidDestinationWallet &&
          !isCorrectSrcTokenAmount &&
          !isCorrectExchangeRate
        }
        isValidDestinationWallet={isValidDestinationWallet}
        isValidTokensInput={isCorrectSrcTokenAmount && isCorrectExchangeRate}
      />
    </div>
  );
};

const TokenAmountInput = ({
  label,
  token,
  amount,
  inputLabel,
  handleInputChange,
}: {
  label: string;
  inputLabel: string;
  token: { ticker: string; network: string };
  amount: string;
  isCorrectAmount: boolean;
  handleInputChange: (e: string) => void;
}) => (
  <div className="flex flex-row justify-between items-center text-xs mt-3">
    <div className="flex flex-col justify-between items-start h-full">
      <span className="text-gray-700 h-full">{label}</span>
      <span className="h-full">
        {token.ticker} <span className="text-gray-700">({token.network})</span>
      </span>
    </div>
    <div className="flex flex-col justify-between items-start h-full">
      <span className="ml-2 text-gray-700">{inputLabel}</span>
      <TokenInput
        value={amount}
        setValue={(e) => handleInputChange(e as any)}
        placeholder="0"
      />
    </div>
  </div>
);

const Summary = ({
  srcToken,
  dstToken,
  srcTokenAmount,
  dstTokenAmount,
  address,
  destinationWallet,
  exchangeRate,
}: {
  srcToken: { ticker: string; network: string };
  dstToken: { ticker: string; network: string };
  srcTokenAmount: string;
  dstTokenAmount: string;
  address: string;
  destinationWallet: string;
  exchangeRate: string;
}) => {
  const isSrcAmountExist = srcTokenAmount.length > 0;
  const isDstAmountExist = dstTokenAmount.length > 0;

  const parseExchangeRate = formatNumberWithCommas(
    Number(formatUnits(BigInt(exchangeRate), 6)),
  );

  return (
    <div className="w-full flex flex-col text-xs mt-3">
      <DetailRow label="Amount to pay">
        {isSrcAmountExist ? (
          <span>
            {formatNumberWithCommas(Number(srcTokenAmount))} {dstToken.ticker}{" "}
            <span className={"text-gray-700"}>({dstToken.network})</span>
          </span>
        ) : (
          <span className={"text-gray-700"}>Provide amount to pay</span>
        )}
      </DetailRow>
      <AddressDetailRow label="to Wallet" value={destinationWallet} />
      <AddressDetailRow label="from Wallet" value={address} />
      <DetailRow label="Amount to receive">
        {isDstAmountExist ? (
          <span>
            {formatNumberWithCommas(Number(dstTokenAmount))} {srcToken.ticker}{" "}
            <span className={"text-gray-700"}>({srcToken.network})</span>
          </span>
        ) : (
          <span className={"text-gray-700"}>Provide amount to receive</span>
        )}
      </DetailRow>
      <DetailRow label="Exchange Rate">
        <span>
          {parseExchangeRate} {dstToken.ticker}{" "}
          <span className={"text-gray-700"}>({dstToken.network})</span> = 1{" "}
          {srcToken.ticker}{" "}
          <span className={"text-gray-700"}>({srcToken.network})</span>
        </span>
      </DetailRow>
    </div>
  );
};
