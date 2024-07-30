import { defineConfig } from "@wagmi/cli";
import { blockExplorer, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    blockExplorer({
      baseUrl: "https://base-sepolia.blockscout.com/api",
      contracts: [
        {
          name: "OtcMarket",
          address: "0x829430b3f5f668BaD750594F18F879687c94c24c",
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
