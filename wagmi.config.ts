import { defineConfig } from "@wagmi/cli";
import { blockExplorer, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/lib/wagmi/contracts/abi.ts",
  contracts: [],
  plugins: [
    blockExplorer({
      baseUrl: "https://base-sepolia.blockscout.com/api",
      contracts: [
        {
          name: "OtcMarket",
          address: "0x718D998514B2d09167398fa9477c3b3c6f2BBbd3",
        },
      ],
      getAddress({ address }) {
        if (typeof address === "string") return address;
        return Object.values(address)[0];
      },
      name: "Sepolia",
    }),
  ],
});
