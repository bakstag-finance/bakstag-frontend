import { TronWeb } from "tronweb";

export const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io'
  // fullHost:
  //   process.env.NODE_ENV === "production"
  //     ? process.env.NEXT_PUBLIC_PROD_URL
  //     : process.env.NEXT_PUBLIC_DEV_URL,
});
