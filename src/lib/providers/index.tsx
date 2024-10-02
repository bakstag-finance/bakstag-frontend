"use client";

import { ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi/config";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletProvider as TronWalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";

const queryClient = new QueryClient();

export const RootProvider = ({ children }: { children: ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);
  const tronAdapters = useMemo(function () {
    const tronLinkAdapter = new TronLinkAdapter();
    return [tronLinkAdapter];
  }, []);

  return (
    <TronWalletProvider
      disableAutoConnectOnLoad={true}
      adapters={tronAdapters}
      autoConnect={false}
    >
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <WalletModalProvider>
            <WagmiProvider config={wagmiConfig}>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </WagmiProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </TronWalletProvider>
  );
};
