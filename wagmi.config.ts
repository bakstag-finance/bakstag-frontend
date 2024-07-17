import { defineConfig } from "@wagmi/cli";
import { blockExplorer, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    blockExplorer({
      baseUrl: 'https://sepolia.basescan.org/api',
      contracts: [
        {
          name: 'OtcMarket',
          address: '0xEA8cf4E72Daef673d38A5094BC06036204aab54c',
        },
      ],
      getAddress({ address }) { 
        if (typeof address === 'string') return address
        return Object.values(address)[0] 
      }, 
      name: 'Basescan', 
    }),
  ]
});
