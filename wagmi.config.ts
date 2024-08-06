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
          address: "0x25BC5fb512Fd3BDbd53420D258AA6f84DA723700",
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
