import { Dispatch, SetStateAction } from "react";

import { ethers } from "ethers";

import { SHARED_SYSTEM_DECIMAL, tokensData } from "../constants";

import { tronOtcAbi } from "../tron/otc";
import { wagmiConfig } from "../wagmi/config";
import { otcMarketAbi } from "../wagmi/contracts/abi";

import { ChainIds, LzFee, Status } from "@/types/contracts";
import { handleContractError, hexZeroPadTo32, toSD } from "../helpers";

import { erc20Abi, parseUnits } from "viem";
import { SwitchChainMutateAsync } from "wagmi/query";
import {
  Config,
  readContract,
  ReadContractErrorType,
  simulateContract,
  waitForTransaction,
  writeContract,
  WriteContractErrorType,
} from "@wagmi/core";

import {
  CreateModalStep,
  TransactionData,
} from "@/components/modals/create/context";

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { fromTronToHex } from "../helpers/tron-converter";

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

  const srcToken = tokensData[selectedSrcToken];
  const dstToken = tokensData[selectedDstToken];

  const tronWeb = (window as any).tronWeb as any;

  const _dstAddress =
    dstToken.network === "TRON"
      ? tronWeb
        ? `0x${tronWeb.address.toHex(destinationWallet).slice(2)}`
        : fromTronToHex(destinationWallet)
      : destinationWallet;

  const _srcSellerAddress = hexZeroPadTo32(srcAddress!);
  const _dstSellerAddress = hexZeroPadTo32(_dstAddress as `0x${string}`);

  const _dstEid = dstToken.eid as any;
  const _srcTokenAddress = hexZeroPadTo32(srcToken.tokenAddress);
  const _dstTokenAddress = hexZeroPadTo32(dstToken.tokenAddress);

  const _srcAmountLD = parseUnits(srcTokenAmount, srcToken.decimals).toString();
  const _srcAmountSD = toSD(srcTokenAmount);

  const _exchangeRateSD = parseUnits(
    dstTokenAmount,
    SHARED_SYSTEM_DECIMAL,
  ).toString();

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
    _srcAmountSD,
    _exchangeRateSD,
  };
};

interface EVMSwapParams {
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

export const handleEvmCreate = async ({
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
}: EVMSwapParams) => {
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
      _srcAmountSD,
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
    const dstDecimalConversionRate = BigInt(
      10 ** (dstToken.decimals - SHARED_SYSTEM_DECIMAL),
    );

    const isOrderAcceptible =
      _srcAmountSD * BigInt(_exchangeRateSD) * dstDecimalConversionRate >=
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
        const { request } = await simulateContract(wagmiConfig, {
          abi: erc20Abi,
          address: srcToken.tokenAddress,
          functionName: "approve",
          args: [abiConfig.address, srcAmountLD],
          chainId: srcToken.chainId,
        });

        const hash = await writeContract(wagmiConfig, request).catch((e) => {
          const errorMsg = handleContractError(
            e as WriteContractErrorType,
            otcMarketAbi,
          );
          throw new Error(errorMsg);
        });

        await waitForTransaction(wagmiConfig, {
          hash,
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
            srcAmountLD: BigInt(_srcAmountSD),
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

interface TronCreateParams {
  tronWallet: ReturnType<typeof useWallet>;
  approvingStatus: Status;
  setApprovingStatus: Dispatch<SetStateAction<Status>>;
  selectedSrcToken: string;
  selectedDstToken: string;
  srcTokenAmount: string;
  dstTokenAmount: string;
  destinationWallet: string;
  setTransactionData: Dispatch<SetStateAction<TransactionData>>;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  setCurrentStep: Dispatch<SetStateAction<CreateModalStep>>;
  setApprovingErrorMsg: Dispatch<SetStateAction<string>>;
}

export const handleTronCreate = async ({
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
}: TronCreateParams) => {
  try {
    if (!tronWallet.address || approvingStatus === "success") {
      return null;
    }
    const tronWeb = (window as any).tronWeb as any;
    if (!tronWeb) {
      return null;
    }

    setApprovingStatus("pending");

    let _lzFee: LzFee = {
      nativeFee: BigInt(0),
      lzTokenFee: BigInt(0),
    };
    let _value: bigint = BigInt(0);

    const _srcAmountLD = parseUnits(srcTokenAmount, SHARED_SYSTEM_DECIMAL);
    const _exchangeRateSD = parseUnits(dstTokenAmount, SHARED_SYSTEM_DECIMAL);

    let contract = tronWeb.contract(tronOtcAbi.abi, tronOtcAbi.contractAddress);

    const hexAddress = tronWeb.address.toHex(tronWallet.address).slice(2);
    const addressInBytes32 = hexZeroPadTo32(`0x${hexAddress}`);

    const hexDstAddress = hexZeroPadTo32(
      `0x${tronWeb.address.toHex(destinationWallet)}`,
    );

    const quoteCreateParams = [
      hexDstAddress,
      tokensData[selectedDstToken].eid,
      hexZeroPadTo32(tokensData[selectedSrcToken].tokenAddress),
      hexZeroPadTo32(tokensData[selectedDstToken].tokenAddress),
      _srcAmountLD,
      _exchangeRateSD,
    ];

    const [lzFee, { offerId, srcAmountLD }] = await contract[
      "quoteCreateOffer"
    ](addressInBytes32, quoteCreateParams, false).call();

    _lzFee = lzFee;
    _value =
      tokensData[selectedSrcToken].tokenAddress == ethers.constants.AddressZero
        ? BigInt(lzFee.nativeFee.toString()) + BigInt(srcAmountLD.toString())
        : BigInt(lzFee.nativeFee.toString());

    if (
      tokensData[selectedSrcToken].tokenAddress != ethers.constants.AddressZero
    ) {
      const trc20ContractAddress = await tronWeb.address.fromHex(
        tokensData[selectedSrcToken].tokenAddress,
      );
      void tronWeb.setAddress(trc20ContractAddress);

      const functionSelector = "approve(address,uint256)";
      const parameter = [
        { type: "address", value: tronWallet.address! },
        { type: "uint256", value: srcAmountLD },
      ];
      const tx = await tronWeb.transactionBuilder.triggerSmartContract(
        trc20ContractAddress,
        functionSelector,
        {},
        parameter,
      );

      const signedTx = await tronWeb.trx.sign(tx.transaction);
      await tronWeb.trx.sendRawTransaction(signedTx);
    }

    setTransactionData((prevState) => {
      return {
        ...prevState,
        offerId: offerId,
      };
    });

    const createOfferData = [
      hexDstAddress,
      tokensData[selectedDstToken].eid,
      hexZeroPadTo32(tokensData[selectedSrcToken].tokenAddress),
      hexZeroPadTo32(tokensData[selectedDstToken].tokenAddress),
      _srcAmountLD,
      _exchangeRateSD,
    ];

    const txHash = await contract["createOffer"](createOfferData, _lzFee).send({
      callValue: _value,
    });

    if (txHash) {
      setTransactionData((prevState) => {
        return {
          ...prevState,
          txHash: `0x${txHash}`,
          srcEid: Number(tokensData[selectedSrcToken].eid),
          srcChainId: Number(tokensData[selectedSrcToken].chainId) as ChainIds,
          dstEid: Number(tokensData[selectedDstToken].eid),
          srcSellerAddress: `0x${hexAddress}`,
          dstSellerAddress: hexDstAddress,
          srcTokenAddress: hexZeroPadTo32(
            tokensData[selectedSrcToken].tokenAddress,
          ),
          dstTokenAddress: hexZeroPadTo32(
            tokensData[selectedDstToken].tokenAddress,
          ),
          srcAmountLD: _srcAmountLD,
          exchangeRateSD: _exchangeRateSD,
        };
      });

      setApprovingStatus("success");
      setTransactionStatus("pending");
      setCurrentStep("transaction");
    }
  } catch (e) {
    console.log(e);
    setApprovingErrorMsg((e as any).toString());
    setApprovingStatus("error");
  }
};
