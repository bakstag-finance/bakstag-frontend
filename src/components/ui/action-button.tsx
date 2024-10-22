import React, { FC, useState } from "react";
import { useAccount } from "wagmi";
import { Button, LoadingClock } from "@/components/ui/index";
import { CircleCheck, Redo2, Link, Share } from "lucide-react";
import { Status } from "@/types/contracts";
import { Squircle } from "@squircle-js/react";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import { ConnectModal } from "@/components/modals";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

interface ActionButtonProps {
  approvingStatus?: Status;
  approvingErrorMsg?: string;
  btnDisabled?: boolean;
  handleClick: () => void;
  handleClose?: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  loadingText?: string;
  defaultText?: string;
  isValidDestinationWallet?: boolean;
  isValidTokensInput?: boolean;
  isCopy?: boolean;
  offerId?: string;
  refetch?: () => void;
  srcTokenNetwork?: string;
}

export const ActionButton: FC<ActionButtonProps> = ({
  handleClose,
  approvingStatus,
  approvingErrorMsg,
  isLoading,
  isSuccess,
  isError,
  handleClick,
  loadingText,
  defaultText,
  btnDisabled,
  isValidDestinationWallet,
  isValidTokensInput,
  isCopy = false,
  offerId,
  refetch,
  srcTokenNetwork,
}) => {
  const { address } = useAccount();
  const tronWallet = useWallet();

  const isWalletConnected =
    srcTokenNetwork === "TRON" ? !!tronWallet.address : !!address;

  return (
    <>
      <div className="mt-5 relative max-w-full w-full flex justify-center items-center">
        {!isWalletConnected ? (
          <ConnectModal refetch={refetch!} btnText={"Connect Wallet"} />
        ) : (
          <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
            <Button
              className={
                "w-full max-w-sm rounded-xl font-light truncate line-clamp-1"
              }
              variant={getButtonVariant(approvingStatus, isLoading, isError)}
              onClick={handleClick}
              disabled={btnDisabled}
            >
              {getButtonContent(
                isLoading,
                loadingText,
                isError,
                isSuccess,
                defaultText,
                approvingStatus,
                approvingErrorMsg,
                isValidDestinationWallet,
                isValidTokensInput,
              )}
            </Button>
          </Squircle>
        )}
        {isCopy && <CopyButton offerId={offerId || ""} />}
      </div>

      {handleClose && (
        <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
          <Button
            className="w-full mt-3 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800 rounded-xl font-light"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </Squircle>
      )}
    </>
  );
};

const getButtonContent = (
  isLoading?: boolean,
  loadingText?: string,
  isError?: boolean,
  isSuccess?: boolean,
  defaultText?: string,
  approvingStatus?: Status,
  approvingErrorMsg?: string,
  isValidDestinationWallet?: boolean,
  isValidTokensInput?: boolean,
) => {
  if (isLoading)
    return (
      <span className="flex flex-row items-center justify-center">
        <LoadingClock className="w-6 h-6" />{" "}
        <span className="ml-1">{loadingText}</span>
      </span>
    );
  if (isError)
    return (
      <span className="flex flex-row items-center justify-center">
        <Redo2 className="w-5 h-5 mr-2" /> Retry
      </span>
    );
  if (isSuccess)
    return (
      <span className="flex flex-row items-center justify-center">
        <CircleCheck className="w-5 h-5 mr-2" /> Done
      </span>
    );
  if (approvingStatus === "error") return approvingErrorMsg;
  if (!isValidDestinationWallet) return "Add Destination Wallet Address";
  if (!isValidTokensInput) return "Invalid Tokens Amount";
  if (approvingStatus === "pending") return "Pending Confirmation";
  return defaultText;
};

const getButtonVariant = (
  approvingStatus?: Status,
  isLoading?: boolean,
  isError?: boolean,
) => {
  if (approvingStatus === "pending" || isLoading) return "secondary";
  if (approvingStatus === "error" || isError) return "destructive";
  return "default";
};

interface CopyButtonProps {
  offerId: string;
}

const CopyButton: FC<CopyButtonProps> = ({ offerId }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleCopyLink = () => {
    const offerParams = new URLSearchParams({
      modalType: "accept",
      offerId: offerId,
    });

    const offerLink = `${new URL(`?${offerParams}`, BASE_URL).href}`;
    navigator.clipboard.writeText(offerLink);

    setIsClicked(true);

    setTimeout(() => {
      setIsClicked(false);
    }, 1000);
  };

  return (
    <Button
      onClick={handleCopyLink}
      className={cn(
        "ml-2 h-10 rounded-xl bg-black border border-white border-opacity-50 hover:bg-gray-800 flex justify-center items-center transition-all duration-300 ease-in-out",
        isClicked ? "w-32" : "w-10",
      )}
    >
      <span className="relative flex items-center justify-center">
        {isClicked ? (
          <span
            className={cn(
              "flex items-center",
              isClicked ? "animate-expand" : "animate-collapse",
            )}
          >
            <Link className="ml-2 w-4 h-4 stroke-white" />
            <span
              className="ml-1 font-extralight text-white truncate text-ellipsis"
              style={{
                animationDuration: "300ms",
                animationTimingFunction: "ease-in-out",
              }}
            >
              Copy Link
            </span>
          </span>
        ) : (
          <Share className="w-4 h-4 stroke-white" />
        )}
      </span>
    </Button>
  );
};
