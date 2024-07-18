import { metaMask } from "@wagmi/connectors";
import { http, createConfig } from "@wagmi/core";
import {
  mainnet,
  sepolia,
  fantomTestnet,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
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
    [baseSepolia.id]: http(),
    [fantomTestnet.id]: http(),
    [optimismSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
