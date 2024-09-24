"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from "@/components/ui";
import {
  getTokenField,
  handleContractError,
  hexStripsAddr,
  hexZeroPadTo32,
  isValidTokenAmount,
} from "@/lib/helpers";
import { useAccount, useSwitchChain } from "wagmi";
import { FormStep } from "./form-step";
import { TransactionStep } from "./transaction-step";
import { Status } from "@/types/contracts";
import { OfferProps } from "@/types/offer";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  readContract,
  ReadContractErrorType,
  writeContract,
  type WriteContractErrorType,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { ethers } from "ethers";
import AcceptModalProvider, { useAcceptModal } from "./context";
import { otcMarketAbi } from "@/lib/wagmi/contracts/abi";

const Modal = () => {
  const {
    order,
    openModal,
    setOpenModal,
    step,
    setStep,
    srcTokenAmount,
    setSrcTokenAmount,
    dstTokenAmount,
    setDstTokenAmount,
    setDestinationWallet,
    approvingStatus,
    setApprovingStatus,
    setApprovingErrorMsg,
    transactionStatus,
    setTransactionStatus,
    setInfoForTransactionStep,
  } = useAcceptModal();

  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isWalletConnected = !!address;

  const closeModalHandler = () => {
    setOpenModal(false);
    setStep("main");
    setSrcTokenAmount("0");
    setDstTokenAmount("0");
    setApprovingStatus("idle");
  };

  const prepareDataForContracts = () => {
    const {
      srcToken,
      dstToken,
      srcTokenAddress,
      dstTokenAddress,
      offerId,
      srcAmountLD,
    } = order;

    const _abiConfig = getTokenField(
      srcToken.ticker,
      srcToken.network,
      "otcConfig",
    );

    const _dstTokenChainId = getTokenField(
      dstToken.ticker,
      dstToken.network,
      "chainId",
    );

    const _srcTokenChainId = getTokenField(
      srcToken.ticker,
      srcToken.network,
      "chainId",
    );

    const _dstEid = getTokenField(dstToken.ticker, dstToken.network, "eid");

    const _srcTokenAddress = hexZeroPadTo32(srcTokenAddress as any);
    const _dstTokenAddress = hexZeroPadTo32(dstTokenAddress as any);

    const _srcTokenDecimals = getTokenField(
      srcToken.ticker,
      srcToken.network,
      "decimals",
    );
    const _dstTokenDecimals = getTokenField(
      dstToken.ticker,
      dstToken.network,
      "decimals",
    );

    const _srcAmountSD = parseUnits(dstTokenAmount, 6).toString();
    const _srcAmountLD = parseUnits(
      formatUnits(BigInt(srcAmountLD), _srcTokenDecimals),
      6,
    ).toString();

    const _offerId = offerId;
    return {
      _abiConfig,
      _srcTokenAddress,
      _dstTokenAddress,
      _srcAmountSD,
      _dstTokenChainId,
      _dstTokenDecimals,
      _srcTokenDecimals,
      _offerId,
      _dstEid,
      _srcTokenChainId,
      _srcAmountLD,
    };
  };

  const submitHandler = async () => {
    try {
      if (!isWalletConnected || approvingStatus === "success") {
        return null;
      }

      const {
        _abiConfig,
        _offerId,
        _srcTokenAddress,
        _dstTokenAddress,
        _srcAmountSD,
        _dstTokenChainId,
        _dstEid,
        _dstTokenDecimals,
      } = prepareDataForContracts();

      if (approvingStatus === "idle" || approvingStatus === "error") {
        setApprovingStatus("pending");
        await switchChainAsync({
          chainId: _dstTokenChainId!,
        });

        const [lzFee, { dstAmountLD, feeLD }] = await readContract(
          wagmiConfig,
          {
            abi: _abiConfig.abi,
            address: _abiConfig.address,
            functionName: "quoteAcceptOffer",
            args: [
              _dstTokenAddress,
              JSON.parse(
                JSON.stringify({
                  offerId: _offerId,
                  srcAmountSD: _srcAmountSD,
                  srcBuyerAddress: hexZeroPadTo32(address),
                }),
              ),
              false,
            ],
            chainId: _dstTokenChainId,
          },
        ).catch((e) => {
          const errorMsg = handleContractError(
            e as ReadContractErrorType,
            otcMarketAbi,
          );
          throw new Error(errorMsg);
        });

        setInterval(() => {}, 1000);

        const hexAddressZero = hexZeroPadTo32(ethers.constants.AddressZero);

        let _value =
          _dstTokenAddress == hexAddressZero
            ? lzFee.nativeFee + dstAmountLD
            : lzFee.nativeFee;

        if (_srcTokenAddress != hexAddressZero) {
          await writeContract(wagmiConfig, {
            abi: erc20Abi,
            address: hexStripsAddr(_dstTokenAddress),
            functionName: "approve",
            args: [_abiConfig!.address, dstAmountLD],
            chainId: _dstTokenChainId,
          }).catch((e) => {
            const errorMsg = handleContractError(
              e as WriteContractErrorType,
              otcMarketAbi,
            );
            throw new Error(errorMsg);
          });
        }

        const txHash = await writeContract(wagmiConfig, {
          abi: _abiConfig.abi,
          address: _abiConfig.address,
          functionName: "acceptOffer",
          args: [
            {
              offerId: _offerId as any,
              srcAmountSD: _srcAmountSD as any,
              srcBuyerAddress: hexZeroPadTo32(address),
            },
            lzFee,
          ],
          value: _value,
          chainId: _dstTokenChainId,
        }).catch((e) => {
          const errorMsg = handleContractError(
            e as WriteContractErrorType,
            otcMarketAbi,
          );
          throw new Error(errorMsg);
        });

        if (txHash) {
          const srcAmountLD = (
            BigInt(order.srcAmountLD) -
            parseUnits(dstTokenAmount, _dstTokenDecimals)
          ).toString();

          const parseExchangeRate = formatUnits(
            BigInt(order.exchangeRateSD),
            6,
          );

          setInfoForTransactionStep({
            txHash,
            offerId: _offerId,
            srcChainId: _dstTokenChainId! as any,
            srcEid: _dstEid,
            srcTokenAddress: _srcTokenAddress,
            dstTokenAddress: _dstTokenAddress,
            srcTokenAmount: srcTokenAmount,
            exchangeRate: parseExchangeRate,
            srcAmountLD: srcAmountLD,
            srcToken: order.srcToken,
            dstToken: order.dstToken,
          });
          setTransactionStatus("pending");
          setApprovingStatus("success");
          setStep("transaction");
        }
      }
    } catch (e: any) {
      setApprovingStatus("error");
      setApprovingErrorMsg(e.message);
    }
  };

  const handleResetState = () => {
    setStep("main");
    setSrcTokenAmount("0");
    setDstTokenAmount("0");
    setDestinationWallet("");
    setApprovingStatus("idle");
    setTransactionStatus("idle");
  };

  const handleClose = () => {
    setOpenModal(false);
    handleResetState();
  };

  const handleMaxExceededAmount = (
    inputValue: string,
    orderAmount: string,
    setApprovingStatus: Dispatch<SetStateAction<Status>>,
    setApprovingErrorMessage: Dispatch<SetStateAction<string>>,
  ) => {
    const MAX_VALUE = Number(formatUnits(BigInt(orderAmount), 18));
    const parsedValue = Number(inputValue);

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

      const exchangeRate = Number(formatUnits(BigInt(order.exchangeRateSD), 6));

      if (inputField === "src") {
        const newDstTokenAmount = (
          parseFloat(inputValue) / exchangeRate
        ).toString();
        setDstTokenAmount(newDstTokenAmount);

        handleMaxExceededAmount(
          inputValue,
          order.srcAmountLD,
          setApprovingStatus,
          setApprovingErrorMsg,
        );
      } else {
        const newSrcTokenAmount = (
          parseFloat(inputValue) * exchangeRate
        ).toString();
        setSrcTokenAmount(newSrcTokenAmount);

        handleMaxExceededAmount(
          newSrcTokenAmount,
          order.srcAmountLD,
          setApprovingStatus,
          setApprovingErrorMsg,
        );
      }
    } catch (e) {
      const error = e as ReadContractErrorType;
      console.log(error);
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
      <DialogContent
        className={
          "no-scrollbar w-full h-[90%] md:h-auto overflow-y-scroll max-w-[380px] rounded-3xl bg-black-800"
        }
      >
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <div className={"w-full flex justify-center items-center flex-col"}>
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

interface Props {
  order: OfferProps;
  refetch: () => void;
}

export const AcceptModal = ({ order, refetch }: Props) => (
  <AcceptModalProvider order={order} refetch={refetch}>
    <Modal />
  </AcceptModalProvider>
);
