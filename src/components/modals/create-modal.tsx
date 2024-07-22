"use client";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Input,
  VisuallyHidden,
  Copy,
  SelectCoin,
} from "@/components/ui";
import {
  addressFormat,
  isNumericOrCommaSeparated,
  isValidCryptoAddress,
} from "@/lib/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowUpRight, Clock10, Clock11, Redo2 } from "lucide-react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { tokensIdentity } from "@/lib/constants";
import { otcMarketAbi } from "@/lib/wagmi/contracts/base-otc";

type CreateModalStep = "main" | "transaction";

export const CreateModal = () => {
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<CreateModalStep>("main");

  const [selectedSellToken, setSelectedSellToken] = useState("");
  const [sellAmount, setSellAmount] = useState(0);

  const [selectedReceiveToken, setSelectedReceiveToken] = useState("");
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [destinationWallet, setDestinationWallet] = useState("");

  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient();

  const { address } = useAccount();

  const solanaWalletConnector = useWallet();

  const isSolanaWalletConnected = solanaWalletConnector.connected;

  const isFormValid =
    isValidCryptoAddress(destinationWallet) &&
    receiveAmount > 0 &&
    sellAmount > 0;

  const handleClose = () => setOpenModal(false);

  const handleAmountChange = (amount: string, handle: any) => {
    if (isNumericOrCommaSeparated(amount)) {
      handle(amount);
    }
  };

  const handleCreateSwap = async () => {
    if (!client) {
      return null;
    }

    // const getTX = writeContractAsync({
    //   address: "0xYourContractAddress",
    //   abi: otcMarketAbi,
    //   functionName: "createOffer",
    //   args: [destinationWallet, ]
    // }).then((tx) => {
    //   return client.waitForTransactionReceipt({
    //     hash: tx,
    //   });
    // })
    // 1. Write Conract
    // 3. Start Next Step
    setCurrentStep("transaction");
  };
  const stepsContent = {
    main: (
      <div className={"w-full flex flex-col text-white"}>
        <div className={"flex flex-row justify-between items-center text-xs"}>
          <div className={"w-full flex flex-col justify-between items-start"}>
            <span className={"text-gray-700"}>Token to Sell </span>
            <SelectCoin
              placeholder={"Token to Sell"}
              className={"mt-2"}
              value={selectedSellToken}
              setValue={setSelectedSellToken}
            />
          </div>
          <div
            className={"w-full ml-2 flex flex-col justify-between items-start"}
          >
            <span className={"text-gray-700"}>Amount</span>
            <Input
              className={"mt-2 bg-black border rounded-lg border-gray-800"}
              value={receiveAmount}
              onChange={(e) =>
                handleAmountChange(e.target.value, setReceiveAmount)
              }
            />
          </div>
        </div>
        <div
          className={"flex flex-row justify-between items-center text-xs mt-5"}
        >
          <div className={"w-full flex flex-col justify-between items-start"}>
            <span className={"text-gray-700"}>Token to Recieve </span>
            <SelectCoin
              placeholder={"Token to Recieve"}
              className={"mt-2"}
              value={selectedReceiveToken}
              setValue={setSelectedReceiveToken}
            />
          </div>
          <div
            className={"ml-2 w-full flex flex-col justify-between items-start"}
          >
            <span className={" text-gray-700"}>Set Exchange Rate</span>
            <Input
              className={"mt-2 bg-black border rounded-lg border-gray-800"}
              value={sellAmount}
              onChange={(e) =>
                handleAmountChange(e.target.value, setSellAmount)
              }
            />
          </div>
        </div>
        <div className={"w-full flex flex-col mt-5"}>
          <span className={"text-xs text-gray-700"}>
            Destination Wallet Address | ETH (BASE)
          </span>
          <Input
            className={"mt-2 bg-black border rounded-lg border-gray-800"}
            value={destinationWallet}
            onChange={(e) => setDestinationWallet(e.target.value)}
          />
        </div>
        <div className={"w-full flex flex-col text-xs mt-5"}>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Locked Amount</span>
            <span>
              {sellAmount > 0 && selectedSellToken.length > 1 ? (
                <span>
                  {sellAmount}{" "}
                  <span className={"text-gray-700"}>
                    {tokensIdentity[selectedSellToken].token}{" "}
                    <span className="text-gray-700">
                      ({tokensIdentity[selectedSellToken].network})
                    </span>
                  </span>
                </span>
              ) : (
                <span>N/A</span>
              )}
            </span>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>to Wallet</span>
            {destinationWallet.length > 8 && (
              <div className={"flex flex-row  items-center text-gray-800"}>
                {addressFormat(destinationWallet)}
                <Copy textToCopy={destinationWallet} />
              </div>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>from Wallet</span>
            {address ? (
              <div className={"flex flex-row  items-center text-gray-800"}>
                {addressFormat(address)}
                <Copy
                  textToCopy={solanaWalletConnector.publicKey!.toString()}
                />
              </div>
            ) : (
              <span className={"text-gray-700"}>Connect Wallet</span>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Exchange Rate</span>
            <span>
              10 ETH
              <span className={"text-gray-700"}> (BASE)</span>
            </span>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Exchange Rate</span>
            {sellAmount > 0 && selectedSellToken.length > 0 ? (
              <span>
                {sellAmount}{" "}
                <span className={"text-gray-700"}>
                  {tokensIdentity[selectedSellToken].token}{" "}
                  <span className="text-gray-700">
                    ({tokensIdentity[selectedSellToken].network})
                  </span>
                </span>{" "}
                = 1<span className={"text-gray-700"}> (ETH)</span>
              </span>
            ) : (
              <span className={"text--gray-700"}>Set Exchange Rate</span>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Protocol Fee</span>
            <span>1%</span>
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>Total Receive amount</span>
            {receiveAmount > 0 ? (
              <span>
                {receiveAmount * sellAmount}{" "}
                <span className={"ml-2"}>
                  {tokensIdentity[selectedReceiveToken].token}{" "}
                  <span className="text-gray-700">
                    ({tokensIdentity[selectedReceiveToken].network})
                  </span>
                </span>
              </span>
            ) : (
              <span className={"text-gray-700"}>Set Exchange Rate</span>
            )}
          </div>
        </div>
        <Button
          className={"w-full mt-5"}
          disabled={!isSolanaWalletConnected || !isFormValid}
          onClick={handleCreateSwap}
        >
          {isSolanaWalletConnected
            ? isFormValid
              ? "Sign & Transaction"
              : "Add Destination Wallet Address"
            : "+ Connect SOL (SOL) Wallet"}
        </Button>
        <Button
          className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
          onClick={handleClose}
        >
          Cancel
        </Button>
      </div>
    ),
    transaction: (
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
              className={
                "w-full flex flex-row justify-between items-center my-2"
              }
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
              className={
                "w-full flex flex-row justify-between items-center my-2"
              }
            >
              <span>Amount to pay</span>
              <span>
                214.5 SOL
                <span className={"text-gray-700"}>(SOL)</span>
              </span>
            </div>
            <div
              className={
                "w-full flex flex-row justify-between items-center my-2"
              }
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
              className={
                "w-full flex flex-row justify-between items-center my-2"
              }
            >
              <span>from Wallet</span>
              {solanaWalletConnector.publicKey?.toString() && (
                <div className={"flex flex-row text-gray-800"}>
                  {addressFormat(solanaWalletConnector.publicKey!.toString())}

                  <Copy
                    textToCopy={solanaWalletConnector.publicKey!.toString()}
                  />
                </div>
              )}
            </div>
            <div
              className={
                "w-full flex flex-row justify-between items-center my-2"
              }
            >
              <span>Amount to recieve</span>
              <span>
                10 ETH
                <span className={"text-gray-700"}>(BASE)</span>
              </span>
            </div>
            <div
              className={
                "w-full flex flex-row justify-between items-center my-2"
              }
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
    ),
  };

  const renderStepContent = () => {
    return stepsContent[currentStep];
  };

  return (
    <Dialog open={openModal} onOpenChange={(_open) => setOpenModal(_open)}>
      <DialogTrigger asChild>
        <Button className={"bg-white text-black "}>Create</Button>
      </DialogTrigger>
      <DialogContent className={"w-full max-w-[370px]"}>
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <div
          className={"w-full flex justify-center items-center flex-col pt-5"}
        >
          {renderStepContent()}
          <span className={"text-gray-700 text-xs mt-5 text-justify"}>
            Assets will be locked. After the transaction is successfully
            completed, the assets will be automatically sent to the destination
            wallet address you provided. Verify all details before confirming.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
