"use client";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  VisuallyHidden,
} from "@/components/ui";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { LogOut, Trash, X } from "lucide-react";
import { addressFormat } from "@/lib/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";

type ConnectModalStep = "main" | "wallet-choose";

export const ConnectModal = () => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");

  const [mainTabsStep, setMainTabsStep] = useState("wallet");
  const [walletTabStep, setWalletTabStep] = useState("ethereum");

  const solanaWallet = useWallet();

  const { connect, status, error, failureReason } = useConnect();

  const { disconnect } = useDisconnect();

  const account = useAccount();

  const isWalletConnected = !!account.address;
  const isSolanaWalletConnected = !!solanaWallet.publicKey;

  // useEffect(() => {
  //   if(status === "success" && isWalletConnected || isSolanaWalletConnected) {
  //     setStep("main");
  //   }
  // }, [isWalletConnected, status]);

  const metamaskWalletHandler = async () => {
    if (!account.address) {
      await connect({
        connector: metaMask({
          extensionOnly: true,
        }),
      });
    } else {
      await disconnect();
    }
  };

  const solanaWalletHandler = async () => {
    if (solanaWallet.connected) {
      await solanaWallet.disconnect();
    } else {
      await solanaWallet.select(PhantomWalletName);
      await solanaWallet.connect();
      setStep("main");
    }
  };

  const cancelHandler = () => setOpenModal(false);

  const steps = {
    main: (
      <>
        <Tabs
          defaultValue="wallet"
          value={mainTabsStep}
          onValueChange={(step) => setMainTabsStep(step)}
          className="w-full flex flex-col items-center text-white"
        >
          <TabsList className={"w-full"}>
            <TabsTrigger value="wallet" className={"w-full"}>
              Wallet
            </TabsTrigger>
            <TabsTrigger value="ads" className={"w-full"}>
              Ads
            </TabsTrigger>
          </TabsList>
          <TabsContent value="wallet" className="w-full">
            <div className="w-full flex flex-col">
              <div
                className={`mt-2 border border-gray-800 rounded-xl  h-20  px-5 ${isWalletConnected ? "h-24" : "pt-5"}`}
              >
                <div className={"flex w-full justify-between items-center"}>
                  <div className="flex flex-col text-white text-sm">
                    <span>Ethereum</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (isWalletConnected) {
                        void metamaskWalletHandler();
                      } else {
                        setWalletTabStep("ethereum");
                        setStep("wallet-choose");
                      }
                    }}
                    className={
                      isWalletConnected
                        ? "bg-transparent group  border border-gray-800 w-10 h-10 self-start mt-5 rounded-lg justify-center"
                        : ""
                    }
                  >
                    {isWalletConnected ? (
                      <span>
                        <X
                          className={
                            "text-muted-foreground group-hover:text-white"
                          }
                          size={20}
                        />
                      </span>
                    ) : (
                      <LogOut />
                    )}
                  </Button>
                </div>
                <span
                  className={`text-muted-foreground mt-5 ${!isWalletConnected && "hidden"}`}
                >
                  {isWalletConnected && addressFormat(account.address!)}
                </span>
              </div>
              <div
                className={`mt-2 border border-gray-800 rounded-xl  h-20  px-5 ${isSolanaWalletConnected ? "h-24" : "pt-5"}`}
              >
                <div className={"flex w-full justify-between items-center"}>
                  <div className="flex flex-col text-white text-sm">
                    <span>Solana</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (isSolanaWalletConnected) {
                        void solanaWalletHandler();
                      } else {
                        setWalletTabStep("solana");
                        setStep("wallet-choose");
                      }
                    }}
                    className={
                      isSolanaWalletConnected
                        ? "bg-transparent group  border border-gray-800 w-10 h-10 self-start mt-5 rounded-lg justify-center"
                        : ""
                    }
                  >
                    {isSolanaWalletConnected ? (
                      <span>
                        <X
                          className={
                            "text-muted-foreground group-hover:text-white"
                          }
                          size={20}
                        />
                      </span>
                    ) : (
                      <LogOut />
                    )}
                  </Button>
                </div>
                <span
                  className={`text-muted-foreground mt-5 ${!isSolanaWalletConnected && "hidden"}`}
                >
                  {isSolanaWalletConnected &&
                    addressFormat(solanaWallet.publicKey!.toString())}
                </span>
              </div>
              <div className="my-2 border border-gray-800 text-gray-800 rounded-xl flex w-full h-10 justify-between items-center px-5">
                <span>Tron (in development )</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="ads" className="w-full">
            <div className="w-full flex flex-col">
              <div className="w-full flex flex-row justify-between mt-2">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Token to buy" />
                  </SelectTrigger>
                  <SelectContent className={"bg-black text-white p-2"}>
                    <SelectGroup>
                      <SelectLabel>Optimism Tokens</SelectLabel>
                      <SelectItem value="eth-opt">ETH (Optimism)</SelectItem>
                      <SelectItem value="op-opt">OP (Optimism)</SelectItem>
                      <SelectItem value="usdc-opt">USDC (Optimism)</SelectItem>
                      <SelectItem value="usdt-opt">USDC (Optimism)</SelectItem>
                    </SelectGroup>
                    <SelectSeparator className={"bg-white"} />
                    <SelectGroup>
                      <SelectLabel className={"text-gray-700"}>
                        Solana Tokens
                      </SelectLabel>
                      <SelectItem value="sol-sol">SOL (Solana)</SelectItem>
                      <SelectItem value="usdc-sol">USDC (Solana)</SelectItem>
                      <SelectItem value="usdt-sol">USDT (Solana)</SelectItem>
                    </SelectGroup>
                    <SelectSeparator className={"bg-white"} />
                    <SelectGroup>
                      <SelectLabel>Base Tokens</SelectLabel>
                      <SelectItem value="eth-base">ETH (Base)</SelectItem>
                      <SelectItem value="usdc-base">USDC (Base)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full ml-2" defaultValue={"most"}>
                    <SelectValue placeholder="Most Recent" />
                  </SelectTrigger>
                  <SelectContent className={"bg-black text-white p-2"}>
                    <SelectItem value="most">Most Recent</SelectItem>
                    <SelectItem value="new">Newest</SelectItem>
                    <SelectItem value="old">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-5 w-full flex flex-col max-h-64 overflow-scroll rounded-xl border border-white border-opacity-50 p-2">
                {Array.from(Array(10)).map((_, i) => (
                  <div
                    className="w-full flex flex-row border-b border-white border-opacity-50 h-28 px-2 pb-5 pt-2 "
                    key={`modal-order-${i}`}
                  >
                    <div className="flex flex-col w-full justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-700">
                          Exchange Range
                        </span>
                        <span>22.154 SOL (SOL) </span>
                      </div>
                      <div className="flex flex-col mt-5">
                        <span className="text-xs text-gray-700">
                          Avaliable Amount
                        </span>
                        <span>200 ETH (BASE) </span>
                      </div>
                    </div>
                    <div className="flex justify-center items-end w-10">
                      <Trash className="cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full mt-5 hover:text-black">
              + Create Add
            </Button>
          </TabsContent>
        </Tabs>
      </>
    ),
    "wallet-choose": (
      <>
        <Tabs
          defaultValue="ethereum"
          value={walletTabStep}
          onValueChange={(step) => setWalletTabStep(step)}
          className="w-full flex flex-col items-center text-white"
        >
          <TabsList className={"w-full"}>
            <TabsTrigger value="ethereum" className={"w-full"}>
              Ethereum
            </TabsTrigger>
            <TabsTrigger value="solana" className={"w-full"}>
              Solana
            </TabsTrigger>
            <TabsTrigger value="tron" className={"w-full"}>
              Tron
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ethereum" className="w-full">
            <div className="w-full flex flex-col">
              {status === "pending" ? (
                <div className={"text-center w-full text-sm"}>
                  <span className={"text-white-800"}>Pending Approval</span>{" "}
                  <br />
                  <span className={"text-muted-foreground mt-2 block"}>
                    Please sign the message in your wallet to complete
                    authentication process.
                  </span>
                </div>
              ) : (
                <>
                  <div
                    className="border border-gray-800 rounded-xl flex w-full p-3 mt-5 justify-between items-start px-5 cursor-pointer"
                    onClick={metamaskWalletHandler}
                  >
                    Metamask
                  </div>
                  <div className="border border-gray-800 rounded-xl flex w-full p-3 justify-between items-center px-5 mt-5 cursor-not-allowed text-gray-800">
                    WalletConnect (soon)
                  </div>
                  <div className="border border-gray-800 rounded-xl flex w-full p-3 justify-between items-center px-5 cursor-not-allowed mt-5 text-gray-800">
                    More soon
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="solana" className="w-full">
            <div
              className="border border-gray-800 rounded-xl flex w-full p-3 mt-5 justify-between items-center px-5 cursor-pointer"
              onClick={solanaWalletHandler}
            >
              Phantom Wallet
            </div>
            <div className="border border-gray-800 text-gray-800 rounded-xl flex w-full p-3 mt-5 justify-between items-center px-5 cursor-not-allowed">
              More soon
            </div>
          </TabsContent>
          <TabsContent value={"tron"} className={"w-full"}>
            <div className="border border-gray-800 text-gray-800 rounded-xl flex w-full p-3 mt-5 justify-between items-center px-5 cursor-not-allowed">
              In development
            </div>
          </TabsContent>
        </Tabs>
      </>
    ),
  };

  const walletStepRender = () => {
    return steps[step];
  };

  return (
    <Dialog open={openModal} onOpenChange={(_open) => setOpenModal(_open)}>
      <DialogTrigger asChild>
        <Button className={"bg-white text-black w-full"}> + Connect</Button>
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
          {walletStepRender()}

          <Button
            className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
            onClick={() =>
              step === "main" ? cancelHandler() : setStep("main")
            }
          >
            {step === "main" ? "Cancel" : "Back"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
