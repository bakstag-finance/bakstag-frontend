"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  VisuallyHidden,
} from "@/components/ui";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { LogOut, X } from "lucide-react";
import { addressFormat } from "@/lib/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import { DeletingStep } from "./delete-step";
import { TableComponent } from "./table-ads";
import { Order } from "@/types/order";

type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  refetch: () => void;
}
export const ConnectModal = ({ refetch }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");

  const [mainTabsStep, setMainTabsStep] = useState("wallet");
  const [walletTabStep, setWalletTabStep] = useState("ethereum");

  const [orderData, setOrderData] = useState<Order>({
    offerId: "",
    dstSellerAddress: "",
    dstEid: 0,
    srcTokenAddress: "",
    srcTokenTicker: "",
    srcTokenNetwork: "",
    dstTokenAddress: "",
    dstTokenTicker: "",
    dstTokenNetwork: "",
    srcSellerAddress: "",
    srcAmountLD: BigInt(0),
    exchangeRateSD: BigInt(0),
  });

  const solanaWallet = useWallet();

  const { connect, status } = useConnect();

  const { disconnect } = useDisconnect();

  const account = useAccount();

  const isWalletConnected = !!account.address;
  const isSolanaWalletConnected = !!solanaWallet.publicKey;

  useEffect(() => {
    if (
      status === "success" ||
      (isWalletConnected && isSolanaWalletConnected)
    ) {
      setStep("main");
    }
  }, [isWalletConnected, status]);

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

  const cancelHandler = () => {
    if (step === "main") {
      setMainTabsStep("main");
      setOpenModal(false);
      setStep("main");
    } else {
      setStep("main");
    }
  };

  const steps = {
    main: (
      <>
        <Tabs
          defaultValue="wallet"
          value={mainTabsStep}
          onValueChange={(step) => setMainTabsStep(step)}
          className="w-full flex flex-col items-center text-white"
        >
          <TabsList className={"w-full rounded-xl"}>
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
            <TableComponent setStep={setStep} setOrderData={setOrderData} />
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
            <TabsTrigger
              value="ethereum"
              className={"w-full"}
              disabled={isWalletConnected}
            >
              Ethereum
            </TabsTrigger>
            <TabsTrigger
              value="solana"
              className={"w-full"}
              disabled={isSolanaWalletConnected}
            >
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
            <span className={"mt-5 text-gray-800"}>
              Tron and USDT (TRC-20) coming soon. <br /> Currently in
              development
            </span>
          </TabsContent>
        </Tabs>
      </>
    ),
    delete: (
      <DeletingStep order={orderData} setStep={setStep} refetch={refetch} />
    ),
  };

  const walletStepRender = () => {
    return steps[step];
  };

  const onOpenChangeHandler = (_open: boolean) => {
    if (!_open) {
      setMainTabsStep("main");
    }

    setOpenModal(_open);
  };

  return (
    <Dialog open={openModal} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger asChild>
        <Button
          className={"bg-white text-black w-full rounded-xl font-extralight"}
        >
          {" "}
          {isWalletConnected || isSolanaWalletConnected
            ? "Connected"
            : "+ Connect"}
        </Button>
      </DialogTrigger>
      <DialogContent className={"w-full max-w-[370px] r"}>
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        <div className={"w-full flex justify-center items-center flex-col"}>
          {walletStepRender()}

          <Button
            className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800 rounded-xl"
            onClick={cancelHandler}
          >
            {step === "main" ? "Cancel" : "Back"}
          </Button>
          {step === "delete" ? (
            <span className="text-xs text-gray-700 mt-5">
              After the AD offer is terminated, the remaining assets will be
              automatically unlocked. Termination is irreversible and cannot be
              undone.
            </span>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
