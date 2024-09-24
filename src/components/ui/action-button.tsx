import { FC } from "react";
import { useAccount } from "wagmi";
import { Button, LoadingClock } from "@/components/ui/index";
import { CircleCheck, Redo2 } from "lucide-react";
import { WalletConnect } from "@/components/modals/wallet-connect";
import { Status } from "@/types/contracts";
import { Squircle } from "@squircle-js/react";

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
}) => {
  const { address } = useAccount();
  const isWalletConnected = !!address;

  return (
    <>
      {!isWalletConnected ? (
        <WalletConnect />
      ) : (
        <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
          <Button
            className="w-full mt-5 rounded-xl"
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

      {handleClose && (
        <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
          <Button
            className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800 rounded-xl"
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
      <span className={"flex flex-row items-center justify-center"}>
        <LoadingClock className={"w-6 h-6"} />{" "}
        <span className={"ml-1"}>{loadingText}</span>
      </span>
    );
  if (isError)
    return (
      <>
        <Redo2 className="w-5 h-5 mr-2" /> Retry
      </>
    );
  if (isSuccess)
    return (
      <>
        <CircleCheck className="w-5 h-5 mr-2" /> Done
      </>
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
