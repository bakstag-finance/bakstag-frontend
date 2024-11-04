import { AddressInput, TokenInput } from "@/components/ui";
import { isValidCryptoAddress, isValidTokenAmount } from "@/lib/helpers";
import { formatUnits } from "viem";
import { useAcceptModal } from "./context";
import { useAccount } from "wagmi";
import { AddressDetailRow, DetailRow } from "@/components/molecules";
import { ActionButton } from "@/components/ui/";
import { formatNumberWithCommas } from "@/lib/helpers/formating";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

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
    offer,
    approvingStatus,
    approvingErrorMsg,
    srcTokenAmount,
    dstTokenAmount,
    destinationWallet,
    setDestinationWallet,
  } = useAcceptModal();

  const { address } = useAccount();
  const { address: tronAddress } = useWallet();

  if (!offer) {
    return null;
  }

  const { srcTokenTicker, srcTokenNetwork, dstTokenTicker, dstTokenNetwork } =
    offer;

  const isCorrectSrcTokenAmount = isValidTokenAmount(srcTokenAmount);
  const isCorrectDstTokenAmount = isValidTokenAmount(dstTokenAmount);

  const isValidDestinationWallet = isValidCryptoAddress(
    destinationWallet,
    srcTokenNetwork,
  );

  const srcAddress =
    srcTokenNetwork === "TRON" ? tronAddress ?? "" : address ?? "";

  return (
    <div className="w-full max-w-[320px] flex flex-col text-white">
      <TokenAmountInput
        label="You Pay"
        token={{
          ticker: dstTokenTicker,
          network: dstTokenNetwork,
        }}
        amount={dstTokenAmount}
        inputLabel={"Amount to pay"}
        isCorrectAmount={isCorrectDstTokenAmount}
        handleInputChange={(e) => handleInputChange(e, "dst")}
      />
      <TokenAmountInput
        label="You receive"
        token={{
          ticker: srcTokenTicker,
          network: srcTokenNetwork,
        }}
        amount={srcTokenAmount}
        inputLabel={"Amount to receive"}
        isCorrectAmount={isCorrectSrcTokenAmount}
        handleInputChange={(e) => handleInputChange(e, "src")}
      />
      <AddressInput
        label={`Destination Wallet Address | ${srcTokenTicker} (${srcTokenNetwork})`}
        value={destinationWallet}
        setValue={setDestinationWallet}
        network={srcTokenNetwork}
      />
      <Summary
        srcToken={{
          ticker: srcTokenTicker,
          network: srcTokenNetwork,
        }}
        dstToken={{
          ticker: dstTokenTicker,
          network: dstTokenNetwork,
        }}
        srcTokenAmount={srcTokenAmount}
        dstTokenAmount={dstTokenAmount}
        address={srcAddress}
        destinationWallet={destinationWallet}
        exchangeRate={offer.exchangeRateSD.toString()}
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
          !isCorrectDstTokenAmount
        }
        isValidDestinationWallet={isValidDestinationWallet}
        isValidTokensInput={isCorrectSrcTokenAmount && isCorrectDstTokenAmount}
        isCopy={true}
        offerId={offer.offerId}
        srcTokenNetwork={srcTokenNetwork}
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
      <AddressDetailRow
        label="to Wallet"
        value={address}
        network={srcToken.network}
      />
      <AddressDetailRow
        label="from Wallet"
        value={destinationWallet}
        network={srcToken.network}
      />
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
