import { Dispatch, SetStateAction } from "react";

import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  getTokenField,
  handleContractError,
  hexStripsAddr,
  hexZeroPadTo32,
} from "../helpers";

import { SwitchChainMutateAsync } from "wagmi/query";
import {
  Config,
  readContract,
  ReadContractErrorType,
  writeContract,
  WriteContractErrorType,
} from "@wagmi/core";

import { ConnectModalStep } from "@/components/modals/accept/context";

import { ethers } from "ethers";

import { tronOtcAbi } from "../tron/otc";
import { wagmiConfig } from "../wagmi/config";
import { otcMarketAbi } from "../wagmi/contracts/abi";

import { Offer } from "@/types/offer";
import { Status } from "@/types/contracts";

const prepareDataForContracts = (offer: Offer, dstTokenAmount: string) => {
  const {
    srcTokenTicker,
    srcTokenNetwork,
    dstTokenTicker,
    dstTokenNetwork,
    srcTokenAddress,
    dstTokenAddress,
    offerId,
    srcAmountLD,
  } = offer;

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

export const evmAcceptOffer = async ({
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

      let _lzFee = {
        nativeFee: BigInt(0),
        lzTokenFee: BigInt(0),
      };
      let _dstAmountLD = BigInt(0);

      // Quote on DST Chain
      if (offer.dstTokenNetwork === "SOL") {
        throw new Error("Not Implemented yet!");
      }

      if (offer.dstTokenNetwork === "TRON") {
      } else if (
        offer.dstTokenNetwork === "BASE" ||
        offer.dstTokenNetwork === "OP"
      ) {
        const [lzFee, { dstAmountLD }] = await readContract(wagmiConfig, {
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

        _lzFee = lzFee;
        _dstAmountLD = dstAmountLD;
      }

      const hexAddressZero = hexZeroPadTo32(ethers.constants.AddressZero);

      let _value =
        _dstTokenAddress == hexAddressZero
          ? _lzFee.nativeFee + _dstAmountLD
          : _lzFee.nativeFee;

      if (_dstTokenAddress != hexAddressZero) {
        await writeContract(wagmiConfig, {
          abi: erc20Abi,
          address: hexStripsAddr(_dstTokenAddress),
          functionName: "approve",
          args: [_abiConfig!.address, _dstAmountLD],
          chainId: _dstTokenChainId,
        }).catch((e) => {
          const errorMsg = handleContractError(
            e as WriteContractErrorType,
            otcMarketAbi,
          );
          throw new Error(errorMsg);
        });
      }

      // Execute
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
          _lzFee,
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

export const tronAcceptOffer = async ({
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
    setApprovingErrorMsg(e as string);
    setApprovingStatus("error");
  }
};
