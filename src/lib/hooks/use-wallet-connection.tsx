import { Dispatch, SetStateAction, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { metaMask } from "wagmi/connectors";
import { TronLinkAdapterName } from "@tronweb3/tronwallet-adapter-tronlink";

type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
}

const useWalletConnection = ({ setStep }: Props) => {
  const { connect, status } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useAccount();

  const tronWallet = useWallet();

  const isWalletConnected = !!account.address || tronWallet.connected;

  const isTronConnected = tronWallet.connected;
  const isEVMConnected = !!account.address;

  useEffect(() => {
    if (status === "success" || isWalletConnected) {
      setStep("main");
    }
  }, [isWalletConnected, status, tronWallet.address]);

  const metaMaskConnect = () => {
    connect({
      connector: metaMask({
        extensionOnly: true,
      }),
    });
  };

  const tronLinkConnect = () => {
    tronWallet.select(TronLinkAdapterName);
    tronWallet.wallet?.adapter.connect();
  };

  return {
    connect,
    disconnect,
    account,
    tronWallet,
    isWalletConnected,
    isTronConnected,
    isEVMConnected,
    status,
    metaMaskConnect,
    tronLinkConnect,
  };
};

export default useWalletConnection;
