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
} from "@/components/ui";
import { handleContractError, hexZeroPadTo32, toSD } from "@/lib/helpers";
import { useAccount, useSwitchChain } from "wagmi";
import { tokensData } from "@/lib/constants";
import { wagmiConfig } from "@/lib/wagmi/config";
import { parseUnits } from "viem";
import {
  Config,
  readContract,
  ReadContractErrorType,
  writeContract,
  WriteContractErrorType,
} from "@wagmi/core";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { TransactionStep } from "./transaction-step";
import { FormStep } from "./form-step";
import { LzFee, ChainIds, Status } from "@/types/contracts";
import CreateModalProvider, {
  CreateModalStep,
  TransactionData,
  useCreateModal,
} from "./context";
import { Squircle } from "@squircle-js/react";
import { otcMarketAbi } from "@/lib/wagmi/contracts/abi";
import { Dispatch, SetStateAction } from "react";
import { SwitchChainMutateAsync } from "wagmi/query";
import { tronWeb } from "@/lib/tron";
import { tronOtcAbi } from "@/lib/tron/otc";
import { useWalletConnection } from "@/lib/hooks";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

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
    handleRetry();
    setSelectedSrcToken("");
    setSrcTokenAmount("0");
    setDstTokenAmount("0");
    setSelectedDstToken("");
    setDestinationWallet("");
    setApprovingStatus("idle");
  };

  const handleCreateSwap = async () => {
    if (
      tokensData[selectedSrcToken].network === "BASE" ||
      tokensData[selectedSrcToken].network === "OP"
    ) {
      void handleEvmSwap({
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
    } else if (tokensData[selectedSrcToken].network === "TRON") {
      // setApprovingErrorMsg("No TRX are now avaliable");
      // setApprovingStatus("error");

      // const _srcAmountLD = parseUnits(srcTokenAmount, 18).toString();
      //
      // const _exchangeRateSD = parseUnits(dstTokenAmount, 6).toString();
      let contract = tronWeb.contract(
        tronOtcAbi.abi,
        "TPLfJpnPHxdAKkUZ1gTkHKFKN9UAUByfLx",
      );
      console.log("Contract", contract);

      const params = [
        {
          eid: 40245,
          msgType: 0,
          options:
            "0x0003010021010000000000000000000000000098968000000000000000000000000000e4e1c0",
        },
        {
          eid: 40245,
          msgType: 1,
          options: "0x000301001101000000000000000000000000000186a001000104",
        },
        {
          eid: 40245,
          msgType: 2,
          options: "0x0003010011010000000000000000000000000004a76801000104",
        },
        {
          eid: 40245,
          msgType: 3,
          options: "0x000301001101000000000000000000000000000186a001000104",
        },
      ];

      console.log("Params", params);
      const sendOptions = await contract["setEnforcedOptions"](params).call();

      console.log("SendOptions", sendOptions);

      // const result = await contract.quoteCreateOffer(
      //     tronWallet.address,
      //     {
      //       dstSellerAddress: "TMMmzgw3SfPzJ8c5wHmj1B89VzE36h47aR",
      //       dstEid: "40420",
      //       srcTokenAddress: tokensData[selectedSrcToken].tokenAddress,
      //       dstTokenAddress: tokensData[selectedDstToken].tokenAddress,
      //       srcAmountLD: _srcAmountLD,
      //       exchangeRateSD: _exchangeRateSD,
      //     },
      //     false,
      // ).call();
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

interface PrepareProps {
  selectedSrcToken: string;
  selectedDstToken: string;
  srcTokenAmount: string;
  dstTokenAmount: string;
  destinationWallet: string;
  srcAddress: `0x${string}`;
}

const prepareDataForContracts = ({
  selectedSrcToken,
  selectedDstToken,
  srcTokenAmount,
  dstTokenAmount,
  srcAddress,
  destinationWallet,
}: PrepareProps) => {
  const abiConfig = tokensData[selectedSrcToken].otcConfig;

  const _srcSellerAddress = hexZeroPadTo32(srcAddress!);
  const _dstSellerAddress = hexZeroPadTo32(destinationWallet as `0x${string}`);

  const srcToken = tokensData[selectedSrcToken];
  const dstToken = tokensData[selectedDstToken];

  const _dstEid = dstToken.eid as any;
  const _srcTokenAddress = hexZeroPadTo32(srcToken.tokenAddress);
  const _dstTokenAddress = hexZeroPadTo32(dstToken.tokenAddress);

  const _srcAmountLD = parseUnits(srcTokenAmount, srcToken.decimals).toString();

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

interface EVMSwapProps {
  isWalletConnected: boolean;
  approvingStatus: Status;
  setApprovingStatus: Dispatch<SetStateAction<Status>>;
  selectedSrcToken: string;
  selectedDstToken: string;
  srcTokenAmount: string;
  dstTokenAmount: string;
  destinationWallet: string;
  srcAddress: `0x${string}`;
  switchChainAsync: SwitchChainMutateAsync<Config, unknown>;
  setTransactionData: Dispatch<SetStateAction<TransactionData>>;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  setCurrentStep: Dispatch<SetStateAction<CreateModalStep>>;
  setApprovingErrorMsg: Dispatch<SetStateAction<string>>;
}

const handleEvmSwap = async ({
  isWalletConnected,
  setApprovingStatus,
  approvingStatus,
  selectedSrcToken,
  selectedDstToken,
  srcTokenAmount,
  dstTokenAmount,
  destinationWallet,
  srcAddress,
  switchChainAsync,
  setTransactionData,
  setTransactionStatus,
  setCurrentStep,
  setApprovingErrorMsg,
}: EVMSwapProps) => {
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
    } = prepareDataForContracts({
      selectedSrcToken,
      selectedDstToken,
      srcTokenAmount,
      dstTokenAmount,
      destinationWallet,
      srcAddress,
    });

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
        const errorMsg = handleContractError(
          e as ReadContractErrorType,
          otcMarketAbi,
        );
        throw new Error(errorMsg);
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
          const errorMsg = handleContractError(
            e as WriteContractErrorType,
            otcMarketAbi,
          );
          throw new Error(errorMsg);
        });
      }

      setTransactionData((prevState) => {
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
        const errorMsg = handleContractError(
          e as WriteContractErrorType,
          otcMarketAbi,
        );
        throw new Error(errorMsg);
      });

      if (txHash) {
        setTransactionData((prevState) => {
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
    setApprovingErrorMsg(e.message);
    setApprovingStatus("error");
  }
};
