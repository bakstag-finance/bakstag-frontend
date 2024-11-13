"use client";

import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  VisuallyHidden,
} from "@/components/ui";
import { FormStep } from "./form-step";
import { TransactionStep } from "./transaction-step";

import {
  decodeParams,
  formatNumberWithCommas,
  getTokenField,
  isValidTokenAmount,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { formatUnits } from "viem";

import { useAccount, useSwitchChain } from "wagmi";

import { acceptOffer } from "@/lib/contracts/accept";

import { Status } from "@/types/contracts";
import { Offer } from "@/types/offer";

import AcceptModalProvider, { useAcceptModal } from "./context";
import { SHARED_SYSTEM_DECIMAL } from "@/lib/constants";

const Modal = ({
  openModal,
  closeModalHandler,
  openModalHandler,
  isOpenedByBtn,
  isOfferInfoLoading,
}: {
  openModal: boolean;
  closeModalHandler: () => void;
  openModalHandler: () => void;
  isOpenedByBtn: boolean;
  isOfferInfoLoading: boolean;
}) => {
  const {
    offer,
    step,
    setStep,
    srcTokenAmount,
    setSrcTokenAmount,
    dstTokenAmount,
    setDstTokenAmount,
    setDestinationWallet,
    approvingStatus,
    destinationWallet,
    setApprovingStatus,
    setApprovingErrorMsg,
    transactionStatus,
    setTransactionStatus,
    setInfoForTransactionStep,
  } = useAcceptModal();

  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const isEvmWalletConnected = !!address;

  const tronWallet = useWallet();
  const isTronConnected = tronWallet.connected;

  const submitHandler = async () => {
    if (!offer) {
      return null;
    }
    void acceptOffer({
      isWalletConnected:
        offer.srcTokenAddress === "TRON"
          ? isEvmWalletConnected
          : isTronConnected,
      offer,
      tronWallet,
      srcTokenAmount,
      dstTokenAmount,
      evmWalletAddress: address as `0x${string}`,
      destinationWallet,
      approvingStatus,
      transactionStatus,
      switchChainAsync,
      setApprovingStatus,
      setApprovingErrorMsg,
      setInfoForTransactionStep,
      setTransactionStatus,
      setStep,
    });
  };

  const handleResetState = () => {
    setStep("main");
    setSrcTokenAmount("0");
    setDstTokenAmount("0");
    setDestinationWallet("");
    setApprovingStatus("idle");
    setTransactionStatus("idle");
    closeModalHandler();
  };

  const handleClose = () => {
    handleResetState();
    closeModalHandler();
  };

  const handleMaxExceededAmount = (
    inputValue: string,
    offerAmount: string,
    offerAmountDecimals: number,
    setApprovingStatus: Dispatch<SetStateAction<Status>>,
    setApprovingErrorMessage: Dispatch<SetStateAction<string>>,
  ) => {
    const MAX_VALUE = Number(
      formatUnits(BigInt(offerAmount), offerAmountDecimals),
    );

    const parsedValue = Number(inputValue.replace(/,/g, ""));

    if (MAX_VALUE < parsedValue) {
      setApprovingStatus("error");
      setApprovingErrorMessage("Insufficient Balance");
      return;
    }
  };

  const handleInputChange = async (
    inputValue: string,
    inputField: "src" | "dst",
  ) => {
    try {
      if (!offer) {
        return null;
      }

      if (!isValidTokenAmount(inputValue)) {
        inputField === "src"
          ? setSrcTokenAmount(inputValue)
          : setDstTokenAmount(inputValue);
        return;
      }
      setApprovingStatus("idle");

      if (
        inputValue.length === 0 ||
        inputValue.endsWith(".") ||
        inputValue === "0" ||
        inputValue === "0." ||
        /^0\.0*$/.test(inputValue) ||
        parseFloat(inputValue) < 0.000001
      ) {
        inputField === "src"
          ? setSrcTokenAmount(inputValue)
          : setDstTokenAmount(inputValue);
        return;
      }

      inputField === "src"
        ? setSrcTokenAmount(inputValue)
        : setDstTokenAmount(inputValue);

      const exchangeRate = Number(
        formatUnits(BigInt(offer.exchangeRateSD), SHARED_SYSTEM_DECIMAL),
      );

      if (inputField === "src") {
        const newDstTokenAmount = formatNumberWithCommas(
          parseFloat(inputValue) * exchangeRate,
        );

        setDstTokenAmount(newDstTokenAmount);

        const srcTokenDecimals = getTokenField(
          offer.srcTokenTicker,
          offer.srcTokenNetwork,
          "decimals",
        );

        handleMaxExceededAmount(
          newDstTokenAmount,
          offer?.srcAmountLD.toString(),
          srcTokenDecimals,
          setApprovingStatus,
          setApprovingErrorMsg,
        );
      } else {
        const newSrcTokenAmount = formatNumberWithCommas(
          parseFloat(inputValue) / exchangeRate,
        );
        setSrcTokenAmount(newSrcTokenAmount);

        handleMaxExceededAmount(
          newSrcTokenAmount,
          offer?.srcAmountLD.toString(),
          SHARED_SYSTEM_DECIMAL,
          setApprovingStatus,
          setApprovingErrorMsg,
        );
      }
    } catch (e) {
      console.log(e as Error);
    }
  };

  const handleRetry = () => setStep("main");

  const walletStepRender = () => {
    const steps = {
      main: (
        <FormStep
          closeModalHandler={closeModalHandler}
          submitHandler={submitHandler}
          handleInputChange={handleInputChange}
        />
      ),
      transaction: (
        <TransactionStep handleRetry={handleRetry} handleClose={handleClose} />
      ),
    };

    return steps[step];
  };

  const onOpenChangeHandler = (_open: boolean) => {
    if (!_open) {
      if (transactionStatus === "pending") {
        return;
      }
      handleResetState();
    } else {
      void openModalHandler();
    }
  };
  return (
    <Dialog open={openModal} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "bg-white text-black rounded-xl font-extralight",
            !isOpenedByBtn && "hidden",
          )}
        >
          Accept
        </Button>
      </DialogTrigger>
      <DialogContent
        className={
          "no-scrollbar w-full  h-full max-h-[90%] md:h-auto overflow-y-scroll overflow-x-hidden max-w-[380px] rounded-3xl bg-black-800"
        }
      >
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <div className={"w-full flex justify-center items-center flex-col"}>
          {isOfferInfoLoading ? (
            <Skeleton className={"h-[50%] w-full"} />
          ) : (
            <>
              {" "}
              {walletStepRender()}
              <span className={"text-gray-700 text-xs mt-3 text-justify"}>
                The advertiser&apos;s assets are locked. After the transaction
                is successfully completed, the assets will be automatically sent
                to the destination wallet address you provided. Verify all
                details before confirming.
              </span>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface Props {
  offer?: Offer;
  refetch: () => void;
  isOpenedByBtn: boolean;
}

export const AcceptModal = ({ offer, refetch, isOpenedByBtn }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modalType = searchParams.get("modalType");
  const offerId = decodeParams(searchParams.get("offerId") || "");

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (modalType === "accept" && offerId && !isOpenedByBtn) {
      setIsModalOpen(true);
    }
  }, [modalType, offerId, isOpenedByBtn]);

  const closeModalHandler = () => {
    setIsModalOpen(false);
    router.push(pathname);
  };

  const { data: fetchedOffer, isLoading } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: async () => {
      const res = await axios.get(`/api/offer/get_one?offerId=${offerId}`);
      return res.data.object || {};
    },
    enabled: !!offerId && !offer,
  });

  const openModalHandler = () => {
    setIsModalOpen(true);
  };

  return (
    <AcceptModalProvider offer={offer || fetchedOffer} refetch={refetch}>
      <Modal
        openModal={isModalOpen}
        closeModalHandler={closeModalHandler}
        openModalHandler={openModalHandler}
        isOpenedByBtn={isOpenedByBtn}
        isOfferInfoLoading={isLoading}
      />
    </AcceptModalProvider>
  );
};
