import { metaMask, injected } from "@wagmi/connectors";
import { http, createConfig, createStorage, cookieStorage } from "@wagmi/core";
import { mainnet, sepolia } from "@wagmi/core/chains";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
