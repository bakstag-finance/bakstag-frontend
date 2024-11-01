"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  formatNumberWithCommas,
  getTokenField,
  handleContractError,
  hexStripsAddr,
  hexZeroPadTo32,
  isValidTokenAmount,
} from "@/lib/helpers";
import { useAccount, useSwitchChain } from "wagmi";
import { FormStep } from "./form-step";
import { TransactionStep } from "./transaction-step";
import { LzFee, Status } from "@/types/contracts";
import { Offer } from "@/types/offer";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  Config,
  readContract,
  ReadContractErrorType,
  writeContract,
  type WriteContractErrorType,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi/config";
import { ethers } from "ethers";
import AcceptModalProvider, {
  ConnectModalStep,
  useAcceptModal,
} from "./context";
import { otcMarketAbi } from "@/lib/wagmi/contracts/abi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import { SwitchChainMutateAsync } from "wagmi/query";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { tronOtcAbi } from "@/lib/tron/otc";

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

    if (
      (offer.srcTokenNetwork === "BASE" || offer.srcTokenNetwork === "OP") &&
      address
    ) {
      void evmAcceptOffer({
        isWalletConnected: isEvmWalletConnected,
        offer,
        address,
        srcTokenAmount,
        dstTokenAmount,
        approvingStatus,
        setApprovingStatus,
        setApprovingErrorMsg,
        switchChainAsync,
        setInfoForTransactionStep,
        setTransactionStatus,
        setStep,
      });
      return null;
    }

    if (offer.srcTokenNetwork === "TRON") {
      void tronAcceptOffer({
        isTronConnected,
        offer,
        tronWallet,
        srcTokenAmount,
        dstTokenAmount,
        destinationWallet,
        approvingStatus,
        transactionStatus,
        setApprovingStatus,
        setApprovingErrorMsg,
        setInfoForTransactionStep,
        setTransactionStatus,
        setStep,
      });
      return null;
    }
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
    orderAmount: string,
    orderAmountDecimals: number,
    setApprovingStatus: Dispatch<SetStateAction<Status>>,
    setApprovingErrorMessage: Dispatch<SetStateAction<string>>,
  ) => {
    const MAX_VALUE = Number(
      formatUnits(BigInt(orderAmount), orderAmountDecimals),
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

      const exchangeRate = Number(formatUnits(BigInt(offer.exchangeRateSD), 6));

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
          6,
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
  const offerId = searchParams.get("offerId");

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

const prepareDataForContracts = (order: Offer, dstTokenAmount: string) => {
  const {
    srcTokenTicker,
    srcTokenNetwork,
    dstTokenTicker,
    dstTokenNetwork,
    srcTokenAddress,
    dstTokenAddress,
    offerId,
    srcAmountLD,
  } = order;

  const _abiConfig = getTokenField(
    srcTokenTicker,
    srcTokenNetwork,
    "otcConfig",
  );

  const _dstTokenChainId = getTokenField(
    dstTokenTicker,
    dstTokenNetwork,
    "chainId",
  );

  const _srcTokenChainId = getTokenField(
    srcTokenTicker,
    srcTokenNetwork,
    "chainId",
  );

  const _dstEid = getTokenField(dstTokenTicker, dstTokenNetwork, "eid");

  const _srcTokenAddress = hexZeroPadTo32(srcTokenAddress as any);
  const _dstTokenAddress = hexZeroPadTo32(dstTokenAddress as any);

  const _srcTokenDecimals = getTokenField(
    srcTokenTicker,
    srcTokenNetwork,
    "decimals",
  );
  const _dstTokenDecimals = getTokenField(
    dstTokenTicker,
    dstTokenNetwork,
    "decimals",
  );

  const _srcAmountSD = parseUnits(dstTokenAmount, 6).toString();
  const _srcAmountLD = parseUnits(
    formatUnits(BigInt(srcAmountLD), _srcTokenDecimals),
    6,
  ).toString();

  const _dstAmountSD = parseUnits(dstTokenAmount, 6).toString();
  const _offerId = offerId;
  return {
    _abiConfig,
    _srcTokenAddress,
    _dstTokenAddress,
    _srcAmountSD,
    _dstTokenChainId,
    _dstTokenDecimals,
    _srcTokenDecimals,
    _dstAmountSD,
    _offerId,
    _dstEid,
    _srcTokenChainId,
    _srcAmountLD,
  };
};

interface evmAcceptOffer {
  isWalletConnected: boolean;
  offer: Offer;
  address: `0x${string}`;
  srcTokenAmount: string;
  dstTokenAmount: string;
  approvingStatus: Status;
  switchChainAsync: SwitchChainMutateAsync<Config, unknown>;
  setApprovingStatus: Dispatch<SetStateAction<Status>>;
  setApprovingErrorMsg: Dispatch<SetStateAction<string>>;
  setInfoForTransactionStep: Dispatch<SetStateAction<any>>;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
}

const evmAcceptOffer = async ({
  offer,
  address,
  srcTokenAmount,
  dstTokenAmount,
  switchChainAsync,
  isWalletConnected,
  approvingStatus,

  setApprovingErrorMsg,
  setApprovingStatus,
  setInfoForTransactionStep,
  setTransactionStatus,
  setStep,
}: evmAcceptOffer) => {
  try {
    if (!isWalletConnected || approvingStatus === "success" || !offer) {
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
    } = prepareDataForContracts(offer, dstTokenAmount);

    if (approvingStatus === "idle" || approvingStatus === "error") {
      setApprovingStatus("pending");
      await switchChainAsync({
        chainId: _dstTokenChainId!,
      });

      const [lzFee, { dstAmountLD, feeLD }] = await readContract(wagmiConfig, {
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
      }).catch((e) => {
        const errorMsg = handleContractError(
          e as ReadContractErrorType,
          otcMarketAbi,
        );
        throw new Error(errorMsg);
      });

      const hexAddressZero = hexZeroPadTo32(ethers.constants.AddressZero);

      let _value =
        _dstTokenAddress == hexAddressZero
          ? lzFee.nativeFee + dstAmountLD
          : lzFee.nativeFee;

      if (_dstTokenAddress != hexAddressZero) {
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
          BigInt(offer.srcAmountLD) -
          parseUnits(dstTokenAmount, _dstTokenDecimals)
        ).toString();

        const parseExchangeRate = formatUnits(BigInt(offer.exchangeRateSD), 6);

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
          srcTokenTicker: offer.srcTokenTicker,
          srcTokenNetwork: offer.srcTokenNetwork,
          dstTokenTicker: offer.dstTokenTicker,
          dstTokenNetwork: offer.dstTokenNetwork,
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

interface TronAcceptOfferProps {
  isTronConnected: boolean;
  offer: Offer;
  tronWallet: any;
  srcTokenAmount: string;
  dstTokenAmount: string;
  destinationWallet: string;
  approvingStatus: Status;
  transactionStatus: Status;
  setApprovingStatus: Dispatch<SetStateAction<Status>>;
  setApprovingErrorMsg: Dispatch<SetStateAction<string>>;
  setInfoForTransactionStep: Dispatch<SetStateAction<any>>;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
}

const prepareDataForAccept = (
  tronWeb: any,
  tronWallet: any,
  destinationWallet: string,
  offer: Offer,
  dstTokenAmount: string,
  srcTokenAmount: string,
) => {
  const _srcAmountSD = parseUnits(srcTokenAmount, 6);

  const hexSrcAddress: `0x${string}` = `0x${tronWeb.address.toHex(tronWallet.address).slice(2)}`;
  const srcAddressBytes32 = hexZeroPadTo32(hexSrcAddress);

  const hexDstAddress: `0x${string}` = `0x${tronWeb.address.toHex(destinationWallet).slice(2)}`;
  const hexDstWallet = hexZeroPadTo32(hexDstAddress);

  const isNativeToken = offer.dstTokenAddress === ethers.constants.AddressZero;

  const _dstTokenDecimals = getTokenField(
    offer.dstTokenTicker,
    offer.dstTokenNetwork,
    "decimals",
  );
  const _dstTokenChainId = getTokenField(
    offer.dstTokenTicker,
    offer.dstTokenNetwork,
    "chainId",
  );

  const parseExchangeRate = formatUnits(BigInt(offer.exchangeRateSD), 6);

  const srcAmountLD = (
    BigInt(offer.srcAmountLD) - parseUnits(dstTokenAmount, _dstTokenDecimals)
  ).toString();

  return {
    _srcAmountSD,
    srcAddressBytes32,
    hexDstWallet,
    isNativeToken,
    _dstTokenDecimals,
    _dstTokenChainId,
    parseExchangeRate,
    srcAmountLD,
  };
};

const tronAcceptOffer = async ({
  isTronConnected,
  offer,
  tronWallet,
  srcTokenAmount,
  dstTokenAmount,
  destinationWallet,
  approvingStatus,
  transactionStatus,
  setApprovingStatus,
  setApprovingErrorMsg,
  setInfoForTransactionStep,
  setTransactionStatus,
  setStep,
}: TronAcceptOfferProps) => {
  try {
    if (!isTronConnected) {
      return null;
    }

    const shouldProcessTransaction = [
      approvingStatus === "idle",
      approvingStatus === "error",
      transactionStatus === "error",
    ].some(Boolean);

    if (shouldProcessTransaction) {
      setApprovingStatus("pending");

      const tronWeb = (window as any).tronWeb as any;
      if (!tronWeb) {
        return null;
      }

      let contract = tronWeb.contract(
        tronOtcAbi.abi,
        tronOtcAbi.contractAddress,
      );

      const {
        _srcAmountSD,
        srcAddressBytes32,
        hexDstWallet,
        isNativeToken,
        _dstTokenChainId,
        parseExchangeRate,
        srcAmountLD,
      } = prepareDataForAccept(
        tronWeb,
        tronWallet,
        destinationWallet,
        offer,
        dstTokenAmount,
        srcTokenAmount,
      );

      const quoteAcceptOffer = [offer.offerId, _srcAmountSD, srcAddressBytes32];

      const [lzFee, { dstAmountLD }] = await contract["quoteAcceptOffer"](
        hexDstWallet,
        quoteAcceptOffer,
        false,
      ).call();

      void tronWeb.setAddress(tronOtcAbi.contractAddress);

      const _value = isNativeToken
        ? BigInt(lzFee.nativeFee.toString()) + BigInt(dstAmountLD.toString())
        : BigInt(lzFee.nativeFee.toString());

      if (!isNativeToken) {
        const tokenContractAddress = tronWeb.address.fromHex(
          getTokenField(
            offer.dstTokenTicker,
            offer.dstTokenNetwork,
            "tokenAddress",
          ),
        );

        const functionSelector = "approve(address,uint256)";
        const parameter = [
          { type: "address", value: tronOtcAbi.contractAddress },
          { type: "uint256", value: dstAmountLD },
        ];

        const tx = await tronWeb.transactionBuilder.triggerSmartContract(
          tokenContractAddress,
          functionSelector,
          {},
          parameter,
        );

        const signedTx = await tronWeb.trx.sign(tx.transaction);
        await tronWeb.trx.sendRawTransaction(signedTx);
      }

      const acceptOfferData = [offer.offerId, _srcAmountSD, srcAddressBytes32];

      const txHash = await contract["acceptOffer"](acceptOfferData, lzFee).send(
        {
          callValue: _value,
        },
      );

      if (txHash) {
        setInfoForTransactionStep({
          txHash,
          offerId: offer.offerId,
          srcChainId: _dstTokenChainId,
          srcEid: offer.dstEid,
          srcTokenAddress: offer.srcTokenAddress,
          dstTokenAddress: offer.dstTokenAddress,
          srcTokenAmount: srcTokenAmount,
          exchangeRate: parseExchangeRate,
          srcAmountLD: srcAmountLD,
          srcTokenTicker: offer.srcTokenTicker,
          srcTokenNetwork: offer.srcTokenNetwork,
          dstTokenTicker: offer.dstTokenTicker,
          dstTokenNetwork: offer.dstTokenNetwork,
        });
        setTransactionStatus("pending");
        setApprovingStatus("success");
        setStep("transaction");
      }
    }
  } catch (e) {
    console.log(e);
    setApprovingErrorMsg("ERROR");
    setApprovingStatus("error");
  }
};
