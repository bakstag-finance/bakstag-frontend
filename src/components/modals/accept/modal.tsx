"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
  Copy,
} from "@/components/ui";
import { addressFormat, isValidCryptoAddress } from "@/lib/helpers";
import { ArrowUpRight, Clock10, Clock11, Redo2 } from "lucide-react";
import { useAccount } from "wagmi";
import { FormStep } from "./form-step";
import { TransactionStep } from "./transaction-step";
import { ApprovingStatus } from "@/types/contracts";

type ConnectModalStep = "main" | "transaction";

interface Props {
  isMobileButton?: boolean;
}

export const AcceptModal = ({}: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");

  const [srcTokenAmount, setSrcTokenAmount] = useState("0.000001");
  const [exchangeRate, setExchangeRate] = useState("0.000001");
  const [destinationWallet, setDestinationWallet] = useState("");

  const isValidDestinationWallet = isValidCryptoAddress(destinationWallet);

  const { address } = useAccount();

  const isWalletConnected = !!address;

  // State of approval
  const [approvingStatus, setApprovingStatus] =
    useState<ApprovingStatus>("idle");
  const [approvingErrorMessage, setApprovingErrorMessage] = useState("");

  const closeModalHandler = () => {
    setOpenModal(false);
    setStep("main");
    setSrcTokenAmount("0.000001");
    setExchangeRate("0.000001");
  };

  const acceptContractHandler = () => {};

  const submitHandler = () => {
    acceptContractHandler();
  };

  const steps = {
    main: (
      <FormStep
        isWalletConnected={isWalletConnected}
        srcTokenAmount={srcTokenAmount}
        setSrcTokenAmount={setSrcTokenAmount}
        exchangeRate={exchangeRate}
        setExchangeRate={setExchangeRate}
        closeModalHandler={closeModalHandler}
        srcWalletAddress={address as any}
        isValidDestinationWallet={isValidDestinationWallet}
        submitHandler={submitHandler}
        destinationWallet={destinationWallet}
        setDestinationWallet={setDestinationWallet}
        approvingStatus={approvingStatus}
        approvingErrorMessage={approvingErrorMessage}
      />
    ),
    transaction: (
      <TransactionStep
        srcWalletAddress={address as any}
        destinationWallet={destinationWallet}
      />
    ),
  };

  const walletStepRender = () => {
    return steps[step];
  };

  const onOpenChangeHandler = (_open: boolean) => {
    if (!_open) {
      setStep("main");
    }

    setOpenModal(_open);
  };

  return (
    <Dialog open={openModal} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger asChild>
        <Button className={"bg-white text-black rounded-xl font-extralight"}>
          Accept
        </Button>
      </DialogTrigger>
      <DialogContent className={"w-full max-w-[370px]"}>
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <div
          className={"w-full flex justify-center items-center flex-col pt-5"}
        >
          {walletStepRender()}
          <span className={"text-gray-700 text-xs mt-3 text-justify"}>
            The advertiser&apos;s assets are locked. After the transaction is
            successfully completed, the assets will be automatically sent to the
            destination wallet address you provided. Verify all details before
            confirming.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
