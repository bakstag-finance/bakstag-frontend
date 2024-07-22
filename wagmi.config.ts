import { defineConfig } from "@wagmi/cli";
import { blockExplorer, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    blockExplorer({
      baseUrl: "https://optimism-sepolia.blockscout.com/api",
      contracts: [
        {
          name: "OtcMarket",
          address: "0x59BCcF525121202FC7D60E0b7A0e88E32D041adB",
        },
      ],
      getAddress({ address }) {
        if (typeof address === "string") return address;
        return Object.values(address)[0];
      },
      name: "Basescan",
    }),
  ],
});
