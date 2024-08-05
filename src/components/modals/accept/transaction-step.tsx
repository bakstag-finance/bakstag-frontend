import { Button, Copy } from "@/components/ui";
import { addressFormat } from "@/lib/helpers";
import { ArrowUpRight, Clock10, Clock11 } from "lucide-react";

interface Props {
  srcWalletAddress: string;
  destinationWallet: string;
}

export const TransactionStep = ({
  srcWalletAddress,
  destinationWallet,
}: Props) => {
  return (
    <>
      <div className={"w-full flex flex-col items-center"}>
        <div
          className={
            "w-full h-24 flex flex-col justify-center items-center mt-2 text-xs text-white"
          }
        >
          <Clock11 className={"w-12 h-12 text-white"} />
          {/*<CircleCheck />*/}
          {/*<FileWarning />*/}
          <span className={"mt-5"}>Pending Transaction</span>
          <span className={"text-gray-700"}>
            you can already view transaction in explorer
          </span>
        </div>
        <div className={"w-full flex flex-col text-xs mt-5 text-white"}>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>TX ID</span>
            <div
              className={
                "flex flex-row items-center justify-center text-gray-800"
              }
            >
              {addressFormat(destinationWallet)}
              <Copy textToCopy={destinationWallet} />
              <ArrowUpRight
                className={
                  "w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white"
                }
              />
            </div>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Amount to pay</span>
            <span>
              214.5 SOL
              <span className={"text-gray-700"}>(SOL)</span>
            </span>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>to Wallet</span>
            {destinationWallet.length > 8 && (
              <div className={"flex flex-row items-center text-gray-800"}>
                {addressFormat(destinationWallet)}
                <Copy textToCopy={destinationWallet} />
              </div>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>from Wallet</span>
            {srcWalletAddress && (
              <div className={"flex flex-row text-gray-800"}>
                {addressFormat(srcWalletAddress)}

                <Copy textToCopy={srcWalletAddress} />
              </div>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Amount to recieve</span>
            <span>
              10 ETH
              <span className={"text-gray-700"}>(BASE)</span>
            </span>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Exchange Rate</span>
            <span>
              22.154 <span className={"text-gray-700"}>SOL</span> = 1
              <span className={"text-gray-700"}>(ETH)</span>
            </span>
          </div>
        </div>
        <Button
          className="w-full mt-5"
          /*onClick={closeModalHandler}*/
          variant={"secondary"}
        >
          {/*<Redo2 className={"w-5 h-5 mr-2"} /> Retry*/}
          <Clock10 className={"w-5 h-5 mr-2"} /> Proccessing Transaction
        </Button>
      </div>
    </>
  );
};
