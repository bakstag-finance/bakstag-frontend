import axios from "axios";

import { ChainIds } from "@/types/contracts";
import { Dispatch, SetStateAction } from "react";

import {
  Config,
  getTransactionReceipt,
  readContract,
  ReadContractErrorType,
  waitForTransaction,
  writeContract,
  WriteContractErrorType,
} from "@wagmi/core";
import { SwitchChainMutateAsync } from "wagmi/query";

import { tronOtcAbi } from "../tron/otc";
import { wagmiConfig } from "../wagmi/config";
import { otcMarketAbi, otcMarketAddress } from "../wagmi/contracts/abi";

import { getTokenField, handleContractError, hexZeroPadTo32 } from "../helpers";
import { Options } from "@layerzerolabs/lz-v2-utilities";

import { Offer } from "@/types/offer";

interface DeleteQueryProps {
  offerId: string;
  setStatus: Dispatch<SetStateAction<Status>>;
  refetch: () => void;
}

const deleteQuery = async ({
  offerId,
  setStatus,
  refetch,
}: DeleteQueryProps) => {
  try {
    setStatus("deleting");
    const response = await axios.post(`/api/offer/delete`, {
      offerId: offerId,
    });

    if (response.status === 200) {
      setStatus("success");
      void refetch();
    }
  } catch (e) {
    console.error(e);
    setStatus("deleting-error");
  }
};

type Status =
  | "loading"
  | "idle"
  | "error"
  | "deleting"
  | "deleting-error"
  | "success";

interface ExecuteTrxProps {
  args: any;
  chainId: ChainIds;
  setTxHash: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<Status>>;
}

const executeTransaction = async ({
  args,
  chainId,
  setTxHash,
  setStatus,
}: ExecuteTrxProps) => {
  try {
    const _txHash = await writeContract(wagmiConfig, {
      abi: otcMarketAbi,
      address: otcMarketAddress,
      functionName: "cancelOffer",
      args,
      value: args[1].nativeFee || BigInt(0),
      chainId,
    }).catch((e) => {
      const errorMsg = handleContractError(
        e as WriteContractErrorType,
        otcMarketAbi,
      );
      throw new Error(errorMsg);
    });

    setTxHash(_txHash);
    setStatus("loading");

    const data = await waitForTransaction(wagmiConfig, { hash: _txHash });

    if (data.status === "reverted") throw new Error("Reverted transaction");

    const txReceipt = await getTransactionReceipt(wagmiConfig, {
      hash: _txHash,
      chainId,
    });

    if (txReceipt.status === "reverted")
      throw new Error("Reverted Transaction");

    return _txHash;
  } catch (e) {
    console.error(e);
    setStatus("error");
  }
};

interface EVMMonochainProps {
  offerId: `0x${string}`;
  srcChainId: ChainIds;
  refetch: () => void;
  setStatus: Dispatch<SetStateAction<Status>>;
  setTxHash: Dispatch<SetStateAction<string>>;
}

const processEvmMonochain = async ({
  offerId,
  srcChainId,
  refetch,
  setStatus,
  setTxHash,
}: EVMMonochainProps) => {
  const args = [
    offerId as `0x${string}`,
    { nativeFee: BigInt(0), lzTokenFee: BigInt(0) },
    "" as `0x${string}`,
  ];

  const _txHash = await executeTransaction({
    args,
    chainId: srcChainId,
    setStatus,
    setTxHash,
  });

  if (_txHash) {
    await deleteQuery({ offerId, refetch, setStatus });
  }
};

interface EVMCrosschainParams {
  srcChainId: ChainIds;
  dstChainId: ChainIds;
  dstTokenNetwork: string;
  offerId: `0x${string}`;
  dstEid: number;
  srcSellerAddress: string;
  refetch: () => void;
  setTxHash: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<Status>>;
  switchChainAsync: SwitchChainMutateAsync<Config, unknown>;
}
const processEvmCrosschain = async ({
  srcChainId,
  dstChainId,
  dstTokenNetwork,
  offerId,
  dstEid,
  setStatus,
  setTxHash,
  refetch,
  srcSellerAddress,
  switchChainAsync,
}: EVMCrosschainParams) => {
  let quoteCancelOffer = {
    lzTokenFee: BigInt(0),
    nativeFee: BigInt(0),
  };

  // Quote on Destination Chain
  if (dstTokenNetwork === "BASE" || dstTokenNetwork === "OP") {
    const quoteRes = await readContract(wagmiConfig, {
      abi: otcMarketAbi,
      address: otcMarketAddress,
      functionName: "quoteCancelOffer",
      args: [offerId],
      chainId: dstChainId,
    }).catch((e) => {
      const errorMsg = handleContractError(
        e as ReadContractErrorType,
        otcMarketAbi,
      );
      throw new Error(errorMsg);
    });
    quoteCancelOffer = quoteRes;
  } else if (dstTokenNetwork === "TRON") {
    const tronWeb = (window as any).tronWeb as any;
    let contract = tronWeb.contract(tronOtcAbi.abi, tronOtcAbi.contractAddress);

    const quoteRes = await contract["quoteCancelOffer"](offerId).call();
    quoteCancelOffer = {
      lzTokenFee: quoteRes.lzTokenFee,
      nativeFee: quoteRes.nativeFee,
    };
  } else {
    console.log("Not Implemented yet");
    throw new Error("Not Implemented yet");
  }

  // Quote on Source Chain
  const _srcAddress = hexZeroPadTo32(srcSellerAddress as `0x${string}`);
  const _options = Options.newOptions().addExecutorLzReceiveOption(
    quoteCancelOffer!.lzTokenFee,
    quoteCancelOffer!.nativeFee,
  );

  const quoteCancelOfferFee = await readContract(wagmiConfig, {
    abi: otcMarketAbi,
    address: otcMarketAddress,
    functionName: "quoteCancelOfferOrder",
    args: [_srcAddress, offerId, _options.toHex() as `0x${string}`, false],
    chainId: srcChainId,
  }).catch((e) => {
    const errorMsg = handleContractError(
      e as ReadContractErrorType,
      otcMarketAbi,
    );
    throw new Error(errorMsg);
  });

  // Execute Transaction
  await switchChainAsync({ chainId: srcChainId! });

  const args = [
    offerId,
    quoteCancelOfferFee!,
    _options.toHex() as `0x${string}`,
  ];

  const _txHash = await executeTransaction({
    args,
    chainId: srcChainId,
    setStatus,
    setTxHash,
  });

  if (_txHash) {
    const receipt = await axios.get(
      `/api/offer/info?txHash=${_txHash}&srcEid=${dstEid}`,
    );

    if (receipt) {
      await deleteQuery({ offerId, refetch, setStatus });
    }
  }
};

interface DeleteHandlerParams {
  offer: Offer;
  refetch: () => void;
  isTronConnected: boolean;
  setStatus: Dispatch<SetStateAction<Status>>;
  setTxHash: Dispatch<SetStateAction<string>>;
  switchChainAsync: SwitchChainMutateAsync<Config, unknown>;
}
const deleteHandler = async ({
  offer,
  refetch,
  setStatus,
  setTxHash,
  isTronConnected,
  switchChainAsync,
}: DeleteHandlerParams) => {
  try {
    const {
      dstTokenNetwork,
      srcTokenNetwork,
      dstTokenTicker,
      srcTokenTicker,
      srcSellerAddress,
      offerId,
      dstEid,
    } = offer;

    if (!offerId) {
      console.log("No order details");
      throw new Error("No order details");
    }

    const isMonochain = dstTokenNetwork === srcTokenNetwork;

    setStatus("loading");
    if (srcTokenNetwork === "BASE" || srcTokenNetwork === "OP") {
      const dstChainId = getTokenField(
        dstTokenTicker,
        dstTokenNetwork,
        "chainId",
      );
      const srcChainId = getTokenField(
        srcTokenTicker,
        srcTokenNetwork,
        "chainId",
      );

      if (isMonochain) {
        await processEvmMonochain({
          offerId: offerId as `0x${string}`,
          srcChainId,
          setStatus,
          setTxHash,
          refetch,
        });
      } else {
        await processEvmCrosschain({
          srcChainId,
          dstChainId,
          dstTokenNetwork,
          offerId: offerId as `0x${string}`,
          dstEid,
          srcSellerAddress,
          refetch,
          setTxHash,
          setStatus,
          switchChainAsync,
        });
      }
      return null;
    }

    if (srcTokenNetwork === "TRON") {
      if (!isTronConnected) {
        return null;
      }
      const tronWeb = (window as any).tronWeb as any;
      if (!tronWeb) {
        return null;
      }

      let contract = tronWeb.contract(
        tronOtcAbi.abi,
        tronOtcAbi.contractAddress,
      );

      if (isMonochain) {
        const txHash = await contract["cancelOffer"](
          offerId,
          [0, 0],
          "0x",
        ).send();

        setTxHash(txHash);
        setStatus("loading");

        if (txHash) {
          await deleteQuery({ offerId, refetch, setStatus });
        }
      } else {
        // Quote on Destination Chain

        if (offer.dstTokenNetwork === "SOL") {
          // TODO: add solana support
          throw new Error("Not implemented yet!");
        }

        const dstChainId = getTokenField(
          dstTokenTicker,
          dstTokenNetwork,
          "chainId",
        );

        const quoteCancelOffer = await readContract(wagmiConfig, {
          abi: otcMarketAbi,
          address: otcMarketAddress,
          functionName: "quoteCancelOffer",
          args: [offerId as `0x${string}`],
          chainId: dstChainId,
        }).catch((e) => {
          const errorMsg = handleContractError(
            e as ReadContractErrorType,
            otcMarketAbi,
          );
          throw new Error(errorMsg);
        });

        // Quote on Source Chain
        const _options = Options.newOptions().addExecutorLzReceiveOption(
          quoteCancelOffer!.lzTokenFee,
          quoteCancelOffer!.nativeFee,
        );
        const quoteCancelOfferFee = await contract["quoteCancelOfferOrder"](
          hexZeroPadTo32(srcSellerAddress as `0x${string}`),
          offerId,
          _options.toHex(),
          false,
        ).call();

        const fee = [
          quoteCancelOfferFee[0].nativeFee,
          quoteCancelOfferFee[0].lzTokenFee,
        ];

        // Cancel Offer
        const _txHash = await contract["cancelOffer"](
          offerId,
          fee,
          _options.toHex(),
        ).send({
          callValue: quoteCancelOfferFee[0].nativeFee,
        });

        console.log("_txHash", _txHash);

        setTxHash(`0x${_txHash}`);
        setStatus("loading");
        if (_txHash) {
          const receipt = await axios.get(
            `/api/offer/info?txHash=0x${_txHash}&srcEid=${offer.dstEid}`,
          );

          if (receipt) {
            await deleteQuery({ offerId, refetch, setStatus });
          }
        }
      }

      return null;
    }

    if (offer.srcTokenNetwork === "SOL") {
      throw new Error("Not implemented yet");
    }
  } catch (e) {
    console.error(e);
    setStatus("error");
  }
};
