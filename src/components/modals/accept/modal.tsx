"use client";

import { ChangeEvent, useState } from "react";
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
import {
  getTokenField,
  hexStripsAddr,
  hexZeroPadTo32,
  isValidCryptoAddress,
  isValidTokenAmount,
} from "@/lib/helpers";
import { useAccount, useSwitchChain } from "wagmi";
import { FormStep } from "./form-step";
import { TransactionStep } from "./transaction-step";
import { ApprovingStatus, LzFee } from "@/types/contracts";
import { OrderProps } from "@/types/order";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import {
  readContract,
  writeContract,
  type WriteContractErrorType,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { ethers } from "ethers";

type ConnectModalStep = "main" | "transaction";

interface Props {
  order: OrderProps;
}

export const AcceptModal = ({ order }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");

  const [srcTokenAmount, setSrcTokenAmount] = useState("0.000001");
  const [dstTokenAmount, setDstTokenAmount] = useState("0.000001");
  const [destinationWallet, setDestinationWallet] = useState(
    "0xe3458913A876f6599d44F7830Ae7347537Ac407a",
  );

  const isValidDestinationWallet = isValidCryptoAddress(destinationWallet);

  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isWalletConnected = !!address;

  // State of approval
  const [approvingStatus, setApprovingStatus] =
    useState<ApprovingStatus>("idle");
  const [approvingErrorMessage, setApprovingErrorMessage] = useState("");

  const closeModalHandler = () => {
    setOpenModal(false);
    setStep("main");
    setSrcTokenAmount("0.000001");
    setDstTokenAmount("0.000001");
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

    const abiConfig = getTokenField(
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

    const _srcTokenAddress = hexZeroPadTo32(srcTokenAddress as any);
    const _dstTokenAddress = hexZeroPadTo32(dstTokenAddress as any);

    const srcTokenDecimals = getTokenField(
      srcToken.ticker,
      srcToken.network,
      "decimals",
    );
    const dstTokenDecimals = getTokenField(
      dstToken.ticker,
      dstToken.network,
      "decimals",
    );

    const _srcAmountSD = parseUnits(
      formatUnits(BigInt(srcAmountLD), srcTokenDecimals),
      6,
    ).toString();

    const _offerId = offerId;
    return {
      abiConfig,
      _srcTokenAddress,
      _dstTokenAddress,
      _srcAmountSD,
      _dstTokenChainId,
      _srcTokenChainId,
      dstTokenDecimals,
      srcTokenDecimals,
      _offerId,
    };
  };

  const submitHandler = async () => {
    // try {
    if (!isWalletConnected || approvingStatus === "success") {
      return null;
    }

    const {
      abiConfig,
      _offerId,
      _srcTokenAddress,
      _dstTokenAddress,
      _srcAmountSD,
      _srcTokenChainId,
      _dstTokenChainId,
    } = prepareDataForContracts();

    if (approvingStatus === "idle" || approvingStatus === "error") {
      setApprovingStatus("pending");
      await switchChainAsync({
        chainId: _srcTokenChainId!,
      });

      const [lzFee, { dstAmountLD, feeLD }] = (await readContract(wagmiConfig, {
        abi: abiConfig.abi,
        address: abiConfig.address,
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
      })) as any;

      const hexAddressZero = hexZeroPadTo32(ethers.constants.AddressZero);

      // const dstTokenAddress =

      let _value =
        _dstTokenAddress == hexAddressZero
          ? lzFee.nativeFee + dstAmountLD
          : lzFee.nativeFee;

      if (_srcTokenAddress != hexAddressZero) {
        await writeContract(wagmiConfig, {
          abi: erc20Abi,
          address: hexStripsAddr(_dstTokenAddress),
          functionName: "approve",
          args: [abiConfig!.address, dstAmountLD],
          chainId: _dstTokenChainId,
        });
      }

      const txHash = await writeContract(wagmiConfig, {
        abi: abiConfig.abi,
        address: abiConfig.address,
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
      });

      if (txHash) {
        console.log(txHash);
      }
    }
    // } catch (e) {
    //   const error = e as WriteContractErrorType
    //   console.log(error);
    //   setApprovingStatus("error");
    //   setApprovingErrorMessage(error.name);
    // }
  };

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    inputField: "src" | "dst",
  ) => {
    try {
      const inputValue = e.target.value;

      if (inputValue.length <= 0 || inputValue.endsWith(".") || !isValidTokenAmount(inputValue)) {
        if (inputField === "src") 
          setSrcTokenAmount(inputValue);
        else 
          setDstTokenAmount(inputValue);
        return;
      }

      const {
        abiConfig,
        _offerId,
        _dstTokenAddress,
        _srcAmountSD,
        _dstTokenChainId,
        dstTokenDecimals,
        srcTokenDecimals,
      } = prepareDataForContracts();

      if (inputField === "src") 
        await handleSrcInputChange(
          inputValue,
          abiConfig,
          _offerId,
          _dstTokenAddress,
          _srcAmountSD,
          _dstTokenChainId!,
          dstTokenDecimals,
          srcTokenDecimals,
        );
      else 
        await handleDstInputChange(
          inputValue,
          abiConfig,
          _offerId,
          _dstTokenAddress,
          _srcAmountSD,
          _dstTokenChainId!,
          dstTokenDecimals,
        );
    } catch (e) {
      const error = e as WriteContractErrorType;
      console.log(error);
    }
  };

  const handleSrcInputChange = async (
    inputValue: string,
    abiConfig: any,
    _offerId: string,
    _dstTokenAddress: string,
    _srcAmountSD: string,
    _dstTokenChainId: number,
    dstTokenDecimals: number,
    srcTokenDecimals: number,
  ) => {
    const MAX_VALUE = BigInt(_srcAmountSD);
    const parsedValue = parseUnits(inputValue, 6);

    if (MAX_VALUE < parsedValue) {
      throw new Error("Value exceeds maximum allowed amount");
    }

    setSrcTokenAmount(inputValue);

    const [_, { dstAmountLD }] = (await readContract(wagmiConfig, {
      abi: abiConfig.abi,
      address: abiConfig.address,
      functionName: "quoteAcceptOffer",
      args: [
        _dstTokenAddress,
        JSON.parse(
          JSON.stringify({
            offerId: _offerId,
            srcAmountSD: _srcAmountSD,
            srcBuyerAddress: hexZeroPadTo32(address!),
          }),
        ),
        false,
      ],
      chainId: _dstTokenChainId as any,
    })) as any;

    const newExchangeRate = formatUnits(dstAmountLD, dstTokenDecimals);
    
    setDstTokenAmount(newExchangeRate);
  };
 
  const handleDstInputChange = async (
    inputValue: string,
    abiConfig: any,
    _offerId: string,
    _dstTokenAddress: string,
    _srcAmountSD: string,
    _dstTokenChainId: number,
    dstTokenDecimals: number,
  ) => {
    const parsedValue = parseUnits(inputValue, dstTokenDecimals);
    setDstTokenAmount(inputValue);

    const [_, { dstAmountLD }] = (await readContract(wagmiConfig, {
      abi: abiConfig.abi,
      address: abiConfig.address,
      functionName: "quoteAcceptOffer",
      args: [
        _dstTokenAddress,
        JSON.parse(
          JSON.stringify({
            offerId: _offerId,
            srcAmountSD: _srcAmountSD,
            srcBuyerAddress: hexZeroPadTo32(address!),
          }),
        ),
        false,
      ],
      chainId: _dstTokenChainId as any,
    })) as any;

    const srcAmountSD = dstAmountLD + parsedValue;
    const formattedValue = formatUnits(srcAmountSD, 6);
    setSrcTokenAmount(formattedValue);
  };

  const steps = {
    main: (
      <FormStep
        isWalletConnected={isWalletConnected}
        srcTokenAmount={srcTokenAmount}
        setSrcTokenAmount={setSrcTokenAmount}
        dstTokenAmount={dstTokenAmount}
        setDstTokenAmount={setDstTokenAmount}
        closeModalHandler={closeModalHandler}
        srcWalletAddress={address as any}
        isValidDestinationWallet={isValidDestinationWallet}
        submitHandler={submitHandler}
        destinationWallet={destinationWallet}
        setDestinationWallet={setDestinationWallet}
        approvingStatus={approvingStatus}
        approvingErrorMessage={approvingErrorMessage}
        order={order}
        handleInputChange={handleInputChange}
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
      closeModalHandler();
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
