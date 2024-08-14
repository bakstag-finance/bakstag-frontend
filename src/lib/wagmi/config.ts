import { metaMask } from "@wagmi/connectors";
import { http, createConfig } from "@wagmi/core";
import {
  mainnet,
  sepolia,
  fantomTestnet,
  baseSepolia,
  base,
  optimismSepolia,
  optimism,
  arbitrumSepolia,
  arbitrum,
} from "@wagmi/core/chains";

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    sepolia,
    baseSepolia,
    fantomTestnet,
    optimismSepolia,
    arbitrumSepolia,
  ],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [baseSepolia.id]: http(),
    [fantomTestnet.id]: http(),
    [optimismSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
