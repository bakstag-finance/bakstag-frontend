"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from "@/components/ui";
import {
  isValidCryptoAddress,
  hexZeroPadTo32,
  toSD,
  formatNumber,
  calculateSrcAmountPerOneDst,
} from "@/lib/helpers";
import { useAccount, useSwitchChain } from "wagmi";
import { tokensData } from "@/lib/constants";
import { wagmiConfig } from "@/lib/wagmi/config";
import { parseUnits } from "viem";
import {
  readContract,
  ReadContractErrorType,
  writeContract,
  WriteContractErrorType,
} from "@wagmi/core";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { TransactionStep } from "./transaction-step";
import { FormStep } from "./form-step";
import { Status, LzFee, ChainIds } from "@/types/contracts";
import { otcMarketConfig } from "@/lib/wagmi/contracts/abi";
import { TokenData } from "@/lib/constants/tokens";

type CreateModalStep = "main" | "transaction";

interface Props {
  buttonText: string;
  refetch: () => void;
}

export const CreateModal = ({ buttonText, refetch }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<CreateModalStep>("main");

  // State of form
  const [selectedDstToken, setSelectedDstToken] = useState("");
  const [dstTokenAmount, setDstTokenAmount] = useState("0");

  const [selectedSrcToken, setSelectedSrcToken] = useState("");
  const [srcTokenAmount, setSrcTokenAmount] = useState("0");

  const [destinationWallet, setDestinationWallet] = useState("");

  // State for transaction step
  const [infoForTransactionStep, setInfoForTransactionStep] = useState({
    txHash: "",
    srcEid: 0,
    srcChainId: undefined as ChainIds,
    offerId: "",
    dstEid: 0,
    srcSellerAddress: "",
    dstSellerAddress: "",
    srcTokenAddress: "",
    dstTokenAddress: "",
    srcAmountLD: BigInt(0),
    exchangeRateSD: BigInt(0),
  });

  // State of Wallet
  const { address } = useAccount();
  const isWalletConnected = !!address;
  const { switchChainAsync } = useSwitchChain();

  // State of approval
  const [approvingStatus, setApprovingStatus] = useState<Status>("idle");
  const [approvingErrorMessage, setApprovingErrorMessage] = useState("");

  // State of transaction proccess
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle");

  const isValidDestinationWallet = isValidCryptoAddress(destinationWallet);

  const handleClose = () => {
    setOpenModal(false);
    handleResetState();
  };
  const handleRetry = () => setCurrentStep("main");

  const handleResetState = () => {
    handleRetry();
    setSelectedSrcToken("");
    setSrcTokenAmount("0.000001");
    setDstTokenAmount("0.000001");
    setSelectedDstToken("");
    setDestinationWallet("");
    setApprovingStatus("idle");
  };

  const prepareDataForContracts = () => {
    const abiConfig = tokensData[selectedSrcToken].otcConfig;

    const _srcSellerAddress = hexZeroPadTo32(address!);
    const _dstSellerAddress = hexZeroPadTo32(destinationWallet as any); // TODO: Replace any to string

    const srcToken = tokensData[selectedSrcToken];
    const dstToken = tokensData[selectedDstToken];

    const _dstEid = dstToken.eid as any;
    const _srcTokenAddress = hexZeroPadTo32(srcToken.tokenAddress);
    const _dstTokenAddress = hexZeroPadTo32(dstToken.tokenAddress);

    const _srcAmountLD = parseUnits(
      srcTokenAmount.toString(),
      srcToken.decimals,
    ).toString();

    const _exchangeRateSD = parseUnits(dstTokenAmount, 6).toString();

    return {
      srcToken,
      dstToken,
      abiConfig,
      _srcSellerAddress,
      _dstSellerAddress,
      _dstEid,
      _srcTokenAddress,
      _dstTokenAddress,
      _srcAmountLD,
      _exchangeRateSD,
    };
  };

  const handleCreateSwap = async () => {
    if (!isWalletConnected || approvingStatus === "success") {
      return null;
    }
    try {
      const {
        abiConfig,
        srcToken,
        dstToken,
        _srcSellerAddress,
        _dstSellerAddress,
        _dstEid,
        _srcTokenAddress,
        _dstTokenAddress,
        _srcAmountLD,
        _exchangeRateSD,
      } = prepareDataForContracts();

      let _lzFee: LzFee = {
        nativeFee: BigInt(0),
        lzTokenFee: BigInt(0),
      };

      let _value: bigint = BigInt(0);
      const srcAmountSD = toSD(_srcAmountLD);
      const dstDecimalConversionRate = BigInt(10 ** (dstToken.decimals - 6));

      const isOrderAcceptible =
        srcAmountSD * BigInt(_exchangeRateSD) * dstDecimalConversionRate >=
        10 ** 8;

      if (
        approvingStatus === "idle" ||
        approvingStatus === "error" ||
        isOrderAcceptible
      ) {
        setApprovingStatus("pending");
        await switchChainAsync({
          chainId: srcToken.chainId!,
        });

        const [lzFee, { offerId, srcAmountLD }] = await readContract(
          wagmiConfig,
          {
            abi: abiConfig.abi,
            address: abiConfig.address,
            functionName: "quoteCreateOffer",
            args: [
              _srcSellerAddress,
              JSON.parse(
                JSON.stringify({
                  dstSellerAddress: _dstSellerAddress,
                  dstEid: _dstEid,
                  srcTokenAddress: _srcTokenAddress,
                  dstTokenAddress: _dstTokenAddress,
                  srcAmountLD: _srcAmountLD,
                  exchangeRateSD: _exchangeRateSD,
                }),
              ),
              false,
            ],
            chainId: srcToken.chainId as any,
          },
        ).catch((e) => {
          const error = e as ReadContractErrorType;
          console.log(error);
          throw new Error(error.name);
        });

        _lzFee = lzFee;
        _value =
          srcToken.tokenAddress == ethers.constants.AddressZero
            ? _lzFee.nativeFee + srcAmountLD
            : _lzFee.nativeFee;

        if (srcToken.tokenAddress != ethers.constants.AddressZero) {
          await writeContract(wagmiConfig, {
            abi: erc20Abi,
            address: srcToken.tokenAddress,
            functionName: "approve",
            args: [abiConfig.address, srcAmountLD],
            chainId: srcToken.chainId,
          }).catch((e) => {
            const error = e as WriteContractErrorType;
            console.log(error);
            throw new Error(error.name);
          });
        }

        setInfoForTransactionStep((prevState) => {
          return {
            ...prevState,
            offerId: offerId,
          };
        });

        const txHash = await writeContract(wagmiConfig, {
          abi: abiConfig.abi,
          address: abiConfig.address,
          functionName: "createOffer",
          args: [
            JSON.parse(
              JSON.stringify({
                dstSellerAddress: _dstSellerAddress,
                dstEid: _dstEid,
                srcTokenAddress: _srcTokenAddress,
                dstTokenAddress: _dstTokenAddress,
                srcAmountLD: _srcAmountLD,
                exchangeRateSD: _exchangeRateSD,
              }),
            ),
            _lzFee as any,
          ],
          value: _value,
          chainId: srcToken.chainId,
        }).catch((e) => {
          const error = e as WriteContractErrorType;
          console.log(error);
          throw new Error(error.name);
        });

        if (txHash) {
          setInfoForTransactionStep((prevState) => {
            return {
              ...prevState,
              txHash,
              srcEid: Number(srcToken.eid),
              srcChainId: Number(srcToken.chainId) as ChainIds,
              dstEid: _dstEid,
              srcSellerAddress: _srcSellerAddress,
              dstSellerAddress: _dstSellerAddress,
              srcTokenAddress: _srcTokenAddress,
              dstTokenAddress: _dstTokenAddress,
              srcAmountLD: BigInt(_srcAmountLD),
              exchangeRateSD: BigInt(_exchangeRateSD),
            };
          });

          setApprovingStatus("success");
          setTransactionStatus("pending");
          setCurrentStep("transaction");
        }
      }
    } catch (e: any) {
      setApprovingErrorMessage(e.message);
      setApprovingStatus("error");
    }
  };

  const stepsContent = {
    main: (
      <FormStep
        srcAddress={address}
        destinationWallet={destinationWallet}
        setDestinationWallet={setDestinationWallet}
        srcTokenAmount={srcTokenAmount}
        setSrcTokenAmount={setSrcTokenAmount}
        dstTokenAmount={dstTokenAmount}
        setDstTokenAmount={setDstTokenAmount}
        handleClose={handleClose}
        handleCreateSwap={handleCreateSwap}
        selectedDstToken={selectedDstToken}
        selectedSrcToken={selectedSrcToken}
        setSelectedSrcToken={setSelectedSrcToken}
        setSelectedDstToken={setSelectedDstToken}
        isWalletConnected={isWalletConnected}
        isValidDestinationWallet={isValidDestinationWallet}
        approvingStatus={approvingStatus}
        approvingErrorMessage={approvingErrorMessage}
      />
    ),
    transaction: (
      <TransactionStep
        destinationWallet={destinationWallet}
        srcAddress={address}
        transactionData={infoForTransactionStep}
        dstTokenAmount={dstTokenAmount}
        handleRetry={handleRetry}
        srcTokenAmount={srcTokenAmount}
        selectedSrcToken={selectedSrcToken}
        selectedDstToken={selectedDstToken}
        handleClose={handleClose}
        setTransactionStatus={setTransactionStatus}
        refetch={refetch}
      />
    ),
  };

  const renderStepContent = () => {
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
        <Button
          className={"bg-white text-black w-full rounded-xl font-extralight"}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogOverlay>
        <DialogContent
          className={
            "no-scrollbar w-full h-[90%] md:h-auto overflow-y-scroll max-w-[380px] bg-black"
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
            <span className={"text-gray-700 text-xs mt-3 text-justify"}>
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
