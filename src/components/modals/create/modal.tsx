"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
  Squircle,
} from "@/components/ui";

import { useAccount, useSwitchChain } from "wagmi";
import { tokensData } from "@/lib/constants";

import { FormStep } from "./form-step";
import { TransactionStep } from "./transaction-step";

import CreateModalProvider, { useCreateModal } from "./context";

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { handleEvmCreate, handleTronCreate } from "@/lib/contracts/create";

interface Props {
  buttonText: string;
  refetch: () => void;
}

const Modal = ({ buttonText, refetch }: Props) => {
  const {
    openModal,
    setOpenModal,
    currentStep,
    setCurrentStep,
    selectedSrcToken,
    setSelectedSrcToken,
    selectedDstToken,
    setSelectedDstToken,
    srcTokenAmount,
    setSrcTokenAmount,
    dstTokenAmount,
    setDstTokenAmount,
    destinationWallet,
    setDestinationWallet,
    approvingStatus,
    setApprovingStatus,
    setApprovingErrorMsg,
    transactionStatus,
    setTransactionStatus,
    setTransactionData,
  } = useCreateModal();

  const { address } = useAccount();
  const isWalletConnected = !!address;

  const { switchChainAsync } = useSwitchChain();

  const tronWallet = useWallet();

  const handleClose = () => {
    setOpenModal(false);
    handleResetState();
  };

  const handleRetry = () => setCurrentStep("main");

  const handleResetState = () => {
    setSelectedSrcToken("");
    setSrcTokenAmount("0");
    setDstTokenAmount("0");
    setSelectedDstToken("");
    setDestinationWallet("");
    setApprovingStatus("idle");
    handleRetry();
  };

  const handleCreateSwap = async () => {
    if (
      tokensData[selectedSrcToken].network === "BASE" ||
      tokensData[selectedSrcToken].network === "OP"
    ) {
      void handleEvmCreate({
        isWalletConnected,
        approvingStatus,
        setApprovingStatus,
        selectedSrcToken,
        selectedDstToken,
        srcTokenAmount,
        dstTokenAmount,
        destinationWallet,
        srcAddress: address!,
        switchChainAsync,
        setTransactionData,
        setTransactionStatus,
        setCurrentStep,
        setApprovingErrorMsg,
      });

      return null;
    }

    if (tokensData[selectedSrcToken].network === "TRON") {
      void handleTronCreate({
        tronWallet,
        approvingStatus,
        setApprovingStatus,
        selectedSrcToken,
        selectedDstToken,
        srcTokenAmount,
        dstTokenAmount,
        destinationWallet,
        setTransactionData,
        setTransactionStatus,
        setCurrentStep,
        setApprovingErrorMsg,
      });

      return null;
    }

    if (tokensData[selectedSrcToken].network === "SOL") {
      return null;
    }
  };

  const renderStepContent = () => {
    const stepsContent = {
      main: (
        <FormStep
          handleClose={handleClose}
          handleCreateSwap={handleCreateSwap}
        />
      ),
      transaction: (
        <TransactionStep
          handleRetry={handleRetry}
          handleClose={handleClose}
          refetch={refetch}
        />
      ),
    };

    return stepsContent[currentStep];
  };

  const onOpenChangeHandler = (_open: boolean) => {
    if (!_open) {
      if (transactionStatus === "pending") {
        return;
      }
      handleResetState();
    }

    setOpenModal(_open);
  };

  return (
    <Dialog open={openModal} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger asChild>
        <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
          <Button
            className={"bg-white text-black w-full rounded-xl font-extralight"}
          >
            {buttonText}
          </Button>
        </Squircle>
      </DialogTrigger>
      <DialogOverlay>
        <DialogContent
          className={
            "no-scrollbar w-full h-full max-h-[90%] md:h-auto overflow-y-scroll max-w-[380px] bg-black-800"
          }
        >
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
          <div className={"w-full flex justify-center items-center flex-col"}>
            {renderStepContent()}
            <span className={"text-gray-700 text-xs mt-3 text-left px-2"}>
              Assets will be locked. Once the ad is accepted by the buyer, the
              assets will be automatically sent to the destination wallet
              address you provided. Please verify all details before confirming.
              You can cancel your ad anytime.
            </span>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export const CreateModal = ({ buttonText, refetch }: Props) => {
  return (
    <CreateModalProvider>
      <Modal buttonText={buttonText} refetch={refetch} />
    </CreateModalProvider>
  );
};
