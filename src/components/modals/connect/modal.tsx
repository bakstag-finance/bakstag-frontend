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
import { LogIn, X } from "lucide-react";
import { addressFormat } from "@/lib/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import { DeletingStep } from "./delete-step";
import { TableComponent } from "./table-ads";
import { Offer } from "@/types/offer";
import { cn } from "@/lib/utils";

type ConnectModalStep = "main" | "wallet-choose" | "delete";

interface Props {
  refetch: () => void;
}
export const ConnectModal = ({ refetch }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");

  const [mainTabsStep, setMainTabsStep] = useState("wallet");
  const [walletTabStep, setWalletTabStep] = useState("ethereum");

  const [orderData, setOrderData] = useState<Offer>({
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
    setStep("main");
    setMainTabsStep("main");
    setOpenModal(false);
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
            <TabsTrigger value="wallet" className={"w-full rounded-lg"}>
              Wallet
            </TabsTrigger>
            <TabsTrigger value="ads" className={"w-full rounded-lg"}>
              Ads
            </TabsTrigger>
          </TabsList>
          <TabsContent value="wallet" className="w-full">
            <div className="w-full flex flex-col">
              {renderWalletButton(
                account.address,
                isWalletConnected,
                "Ethereum",
                metamaskWalletHandler,
              )}
              {renderWalletButton(
                solanaWallet.publicKey?.toString(),
                isSolanaWalletConnected,
                "Solana",
                solanaWalletHandler,
              )}
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
              disabled={isWalletConnected || status === "pending"}
            >
              Ethereum
            </TabsTrigger>
            <TabsTrigger
              value="solana"
              className={"w-full"}
              disabled={isSolanaWalletConnected || status === "pending"}
            >
              Solana
            </TabsTrigger>
            <TabsTrigger
              value="tron"
              className={"w-full"}
              disabled={status === "pending"}
            >
              Tron
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ethereum" className="w-full">
            <div className="w-full flex flex-col">
              {status === "pending" ? (
                <div className={"text-center w-full text-sm mt-3"}>
                  <span className={"text-white-800"}>Pending Approval</span>{" "}
                  <br />
                  <span className={"text-gray-700 mt-3 block"}>
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
    switch (step) {
      case "wallet-choose":
        return steps["wallet-choose"];
      case "delete":
        return steps["delete"];
      default:
        return steps["main"];
    }
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
          {isWalletConnected || isSolanaWalletConnected
            ? "Profile"
            : "+ Connect"}
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar w-full max-w-[380px] bg-black transition-all duration-1000 ease-linear">
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
            disabled={status === "pending"}
          >
            {step === "main" ? "Cancel" : "Back"}
          </Button>
          {step === "delete" ? (
            <span className="text-xs text-gray-700 mt-5">
              After the Ad is canceled, the remaining assets will be
              automatically unlocked to your wallet address
            </span>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const renderWalletButton = (
  address: string | undefined | null,
  isConnected: boolean,
  network: string,
  onClickHandler: () => void,
) => {
  return (
    <div
      className={`mt-2 border border-gray-800 rounded-xl px-5 ${isConnected ? "h-22 py-3" : "h-20 flex justify-center items-center"}`}
    >
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-white">{network}</span>
        </div>
        <Button
          onClick={onClickHandler}
          className={cn(
            "group border border-gray-800 flex self-start justify-center rounded-xl w-10 h-10",
            isConnected ? "bg-transparent mt-3" : "bg-white",
          )}
        >
          <div>
            {isConnected ? (
              <X className="text-gray-700 group-hover:text-white" size={20} />
            ) : (
              <LogIn size={15} className="group-hover:text-white" />
            )}
          </div>
        </Button>
      </div>
      {isConnected && (
        <span className="text-gray-700">{addressFormat(address!)}</span>
      )}
    </div>
  );
};
