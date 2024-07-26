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
          address: "0x94c0D6607c8deB1d674F768C87b091452e73aB0f",
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
