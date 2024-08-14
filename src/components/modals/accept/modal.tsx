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
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  readContract,
  ReadContractErrorType,
  writeContract,
  type WriteContractErrorType,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { ethers } from "ethers";

type ConnectModalStep = "main" | "transaction";

interface Props {
  order: OrderProps;
  refetch: () => void;
}

export const AcceptModal = ({ order, refetch }: Props) => {
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

  // State of transaction proccess
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success"
  >("idle");

  // State for transaction step
  const [infoForTransactionStep, setInfoForTransactionStep] = useState({
    txHash: "",
    offerId: "",
    srcChainId: undefined,
    srcEid: "",
    srcTokenAddress: "",
    dstTokenAddress: "",
    srcTokenAmount: "",
    exchangeRate: "",
    srcAmountLD: "",
    srcToken: {
      ticker: "",
      network: "",
    },
    dstToken: {
      ticker: "",
      network: "",
    },
  });

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
        _srcTokenDecimals,
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
          const error = e as ReadContractErrorType;
          console.log("Error", e);
          throw new Error(error.name);
        });

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
            const error = e as WriteContractErrorType;
            console.log("Errpr", e);
            throw new Error(error.name);
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
        })
        .catch((e) => {
          const error = e as WriteContractErrorType;
          console.log("Error", e);
          throw new Error(error.name);
        });

        if (txHash) {
          const srcAmountLD = (
            BigInt(order.srcAmountLD) -
            parseUnits(dstTokenAmount, _dstTokenDecimals)
          ).toString();
          setInfoForTransactionStep({
            txHash,
            offerId: _offerId,
            srcChainId: _dstTokenChainId! as any,
            srcEid: _dstEid,
            srcTokenAddress: _srcTokenAddress,
            dstTokenAddress: _dstTokenAddress,
            srcTokenAmount: srcTokenAmount,
            exchangeRate: dstTokenAmount,
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
      setApprovingErrorMessage(e.message);
    }
  };

  const handleResetState = () => {};
  const handleClose = () => {
    setOpenModal(false);
    handleResetState();
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const inputValue = e.target.value;

      if (!isValidTokenAmount(inputValue)) {
        return;
      }
      setApprovingStatus("idle");

      if (
        inputValue.length === 0 ||
        inputValue.endsWith(".") ||
        inputValue === "0" ||
        inputValue === "0." ||
        /^0\.0*$/.test(inputValue) ||
        parseFloat(inputValue) < 0.000009
      ) {
        setDstTokenAmount(inputValue);
        return;
      }

      const {
        _abiConfig,
        _offerId,
        _dstTokenAddress,
        _dstTokenChainId,
        _dstTokenDecimals,
        _srcAmountLD,
      } = prepareDataForContracts();

      const MAX_VALUE = BigInt(_srcAmountLD);
      const parsedValue = parseUnits(inputValue, 6);

      const _srcAmountSD = parseUnits(inputValue, 6);
      setDstTokenAmount(inputValue);
      if (MAX_VALUE < parsedValue) {
        setApprovingStatus("error");
        setApprovingErrorMessage("Value exceeds maximum allowed amount");
        return;
      }

      const [_, { dstAmountLD: exchangeRate }] = (await readContract(
        wagmiConfig,
        {
          abi: _abiConfig.abi,
          address: _abiConfig.address,
          functionName: "quoteAcceptOffer",
          args: [
            _dstTokenAddress,
            {
              offerId: _offerId as `0x${string}`,
              srcAmountSD: BigInt(_srcAmountSD),
              srcBuyerAddress: hexZeroPadTo32(address!),
            },
            false,
          ],
          chainId: _dstTokenChainId as any,
        },
      ).catch((e) => {
        const error = e as ReadContractErrorType;
        console.log("Error read", error);
        setApprovingStatus("error");
        setApprovingErrorMessage(e.name);
      })) as any;

      const newExchangeRate = formatUnits(exchangeRate, _dstTokenDecimals);

      setSrcTokenAmount(newExchangeRate);
    } catch (e) {
      const error = e as WriteContractErrorType;
      console.log(error);
    }
  };

  const handleRetry = () => setStep("main");

  const walletStepRender = () => {
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
          handleRetry={handleRetry}
          handleClose={handleClose}
          setTransactionStatus={setTransactionStatus}
          transactionData={infoForTransactionStep}
          refetch={refetch}
        />
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
