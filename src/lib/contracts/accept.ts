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
  simulateContract,
  waitForTransaction,
  writeContract,
  type ReadContractErrorType,
  type WriteContractErrorType,
  type SimulateContractErrorType,
  SimulateContractReturnType,
} from "@wagmi/core";

import { ConnectModalStep } from "@/components/modals/accept/context";

import { ethers } from "ethers";

import { tronOtcAbi } from "../tron/otc";
import { wagmiConfig } from "../wagmi/config";
import { otcMarketAbi, otcMarketAddress } from "../wagmi/contracts/abi";

import { Offer } from "@/types/offer";
import { Status } from "@/types/contracts";
import { SHARED_SYSTEM_DECIMAL } from "../constants";

interface AcceptOfferParams {
  offer: Offer;
  tronWallet: any;
  isWalletConnected: boolean;
  evmWalletAddress: `0x${string}`;
  srcTokenAmount: string;
  dstTokenAmount: string;
  destinationWallet: string;
  approvingStatus: Status;
  transactionStatus: Status;
  switchChainAsync: SwitchChainMutateAsync<Config, unknown>;
  setApprovingStatus: Dispatch<SetStateAction<Status>>;
  setApprovingErrorMsg: Dispatch<SetStateAction<string>>;
  setInfoForTransactionStep: Dispatch<SetStateAction<any>>;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
}

const prepareDataForAccept = (
  offer: Offer,
  srcAddress: `0x${string}`,
  dstAddress: `0x${string}`,
  dstTokenAmount: string,
  srcTokenAmount: string,
) => {
  const _srcAmountSD = parseUnits(srcTokenAmount, SHARED_SYSTEM_DECIMAL);

  const srcAddressBytes32 = hexZeroPadTo32(srcAddress);
  const dstWalletBytes32 = hexZeroPadTo32(dstAddress);

  const isNativeToken =
    offer.dstTokenAddress === hexZeroPadTo32(ethers.constants.AddressZero);

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

  const parseExchangeRate = formatUnits(
    BigInt(offer.exchangeRateSD),
    SHARED_SYSTEM_DECIMAL,
  );

  const srcAmountLD = (
    BigInt(offer.srcAmountLD) - parseUnits(dstTokenAmount, _dstTokenDecimals)
  ).toString();

  return {
    _srcAmountSD,
    srcAddressBytes32,
    dstWalletBytes32,
    isNativeToken,
    _dstTokenDecimals,
    _dstTokenChainId,
    parseExchangeRate,
    srcAmountLD,
  };
};

export const acceptOffer = async ({
  isWalletConnected,
  offer,
  tronWallet,
  srcTokenAmount,
  dstTokenAmount,
  destinationWallet,
  approvingStatus,
  evmWalletAddress,
  transactionStatus,
  switchChainAsync,
  setApprovingStatus,
  setApprovingErrorMsg,
  setInfoForTransactionStep,
  setTransactionStatus,
  setStep,
}: AcceptOfferParams) => {
  try {
    if (!isWalletConnected) {
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

      const contract = tronWeb.contract(
        tronOtcAbi.abi,
        tronOtcAbi.contractAddress,
      );

      void tronWeb.setAddress(tronOtcAbi.contractAddress);

      const _srcAddress: `0x${string}` =
        offer.srcTokenNetwork === "TRON"
          ? `0x${tronWeb.address.toHex(tronWallet.address).slice(2)}`
          : evmWalletAddress;

      const {
        _srcAmountSD,
        srcAddressBytes32,
        dstWalletBytes32,
        isNativeToken,
        _dstTokenChainId,
        parseExchangeRate,
        srcAmountLD,
      } = prepareDataForAccept(
        offer,
        _srcAddress,
        `0x${tronWeb.address.toHex(destinationWallet).slice(2)}`,
        dstTokenAmount,
        srcTokenAmount,
      );

      const {
        dstTokenNetwork,
        offerId,
        srcTokenAddress,
        dstTokenAddress,
        dstTokenTicker,
      } = offer;
      let _lzFee = {
        nativeFee: BigInt(0),
        lzTokenFee: BigInt(0),
      };
      let _dstAmountLD = BigInt(0);

      // Quote on DST Chain
      if (dstTokenNetwork === "SOL") {
        throw new Error("Not Implemented yet!");
      }

      if (dstTokenNetwork === "TRON") {
        const quoteAcceptOffer = [offer.offerId, _srcAmountSD, srcTokenAddress];

        const [lzFee, { dstAmountLD }] = await contract["quoteAcceptOffer"](
          dstWalletBytes32,
          quoteAcceptOffer,
          false,
        )
          .call()
          .catch((e: any) => {
            throw new Error(e);
          });

        _lzFee = lzFee;
        _dstAmountLD = dstAmountLD;
      } else if (dstTokenNetwork === "BASE" || dstTokenNetwork === "OP") {
        await switchChainAsync({
          chainId: _dstTokenChainId!,
        });

        const [lzFee, { dstAmountLD }] = await readContract(wagmiConfig, {
          abi: otcMarketAbi,
          address: otcMarketAddress,
          functionName: "quoteAcceptOffer",
          args: [
            hexZeroPadTo32(dstTokenAddress as `0x${string}`),
            {
              offerId: offerId as `0x${string}`,
              srcAmountSD: _srcAmountSD,
              srcBuyerAddress: srcAddressBytes32,
            },
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

      const _value = isNativeToken
        ? BigInt(_lzFee.nativeFee.toString()) + BigInt(_dstAmountLD.toString())
        : BigInt(_lzFee.nativeFee.toString());

      if (!isNativeToken) {
        if (dstTokenNetwork === "SOL") {
          throw new Error("Not Implemented yet!");
        }

        if (dstTokenNetwork === "TRON") {
          const tokenContractAddress = tronWeb.address.fromHex(
            getTokenField(dstTokenTicker, dstTokenNetwork, "tokenAddress"),
          );

          const functionSelector = "approve(address,uint256)";
          const parameter = [
            { type: "address", value: tronOtcAbi.contractAddress },
            { type: "uint256", value: _dstAmountLD },
          ];

          const tx = await tronWeb.transactionBuilder.triggerSmartContract(
            tokenContractAddress,
            functionSelector,
            {},
            parameter,
          );

          const signedTx = await tronWeb.trx.sign(tx.transaction);
          await tronWeb.trx.sendRawTransaction(signedTx);
        } else if (dstTokenNetwork === "BASE" || dstTokenNetwork === "OP") {
          await switchChainAsync({
            chainId: _dstTokenChainId!,
          });

          const { request }: any = await simulateContract(wagmiConfig, {
            abi: erc20Abi,
            address: hexStripsAddr(dstTokenAddress as `0x${string}`),
            functionName: "approve",
            args: [otcMarketAddress, _dstAmountLD],
            chainId: _dstTokenChainId,
          }).catch((e) => {
            console.log(e as SimulateContractErrorType);
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
      }

      let txHash;
      if (dstTokenNetwork === "SOL") {
        throw new Error("Not implemented yet!");
      }

      if (dstTokenNetwork === "TRON") {
        const acceptOfferData = [offerId, _srcAmountSD, srcAddressBytes32];

        const _txHash = await contract["acceptOffer"](acceptOfferData, _lzFee)
          .send({
            callValue: _value,
          })
          .catch((e: any) => {
            throw new Error(e);
          });

        txHash = `0x${_txHash}`;
      } else if (dstTokenNetwork === "OP" || dstTokenNetwork === "BASE") {
        const _txHash = await writeContract(wagmiConfig, {
          abi: otcMarketAbi,
          address: otcMarketAddress,
          functionName: "acceptOffer",
          args: [
            {
              offerId: offerId as `0x${string}`,
              srcAmountSD: _srcAmountSD,
              srcBuyerAddress: srcAddressBytes32,
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
        txHash = _txHash;
      }

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
      } else {
        throw new Error("Unfortunetly");
      }
    }

    return null;
  } catch (e) {
    console.log(e);
    setApprovingErrorMsg((e as Error).message);
    setApprovingStatus("error");
  }
};
