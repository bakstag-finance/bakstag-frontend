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
} from "@/components/ui";
import { addressFormat, isValidCryptoAddress } from "@/lib/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import {ArrowUpRight, Clock10, Clock11, Redo2} from "lucide-react";

type ConnectModalStep = "main" | "transaction";

export const AcceptModal = () => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");

  const [amountToPay, setAmountToPay] = useState(0);
  const [amountToReceive, setAmountToReceive] = useState(0);
  const [addressInput, setAddressInput] = useState("");

  const solanaWallet = useWallet();

  const isSolanaWalletConneceted = solanaWallet.connected;

  const isFormFullField =
    isValidCryptoAddress(addressInput) &&
    amountToReceive > 0 &&
    amountToPay > 0;

  const closeModalHandler = () => setOpenModal(false);

  function isNumberOrCommaNumber(input: string) {
    const regex = /^-?\d+(,\d+)?$/;
    return regex.test(input);
  }

  const handleAmountInput = (amount: string, handle: any) => {
    if (isNumberOrCommaNumber(amount)) {
      handle(amount);
    }
  };

  const steps = {
    main: (
      <div className={"w-full flex flex-col text-white"}>
        <div className={"flex flex-row justify-between items-center text-xs"}>
          <div className={"flex flex-col justify-between items-start"}>
            <span className={"text-gray-700"}>You Pay</span>
            <span className={"mt-2"}>
              SOL <span className={"text-gray-700"}>(SOL)</span>
            </span>
          </div>
          <div className={"flex flex-col justify-between items-start"}>
            <span className={"ml-2 text-gray-700"}>Amount</span>
            <Input
              className={"mt-2 bg-black border rounded-lg border-gray-800"}
              value={amountToPay}
              onChange={(e) =>
                handleAmountInput(e.target.value, setAmountToPay)
              }
            />
          </div>
        </div>
        <div
          className={"flex flex-row justify-between items-center mt-5 text-xs"}
        >
          <div className={"flex flex-col justify-between items-start"}>
            <span className={"text-gray-700"}>Token to Recieve</span>
            <span className={"mt-2"}>
              ETH <span className={"text-gray-700"}>(BASE)</span>
            </span>
          </div>
          <div className={"flex flex-col justify-between items-start"}>
            <span className={"ml-2 text-gray-700"}>Amount</span>
            <Input
              className={"mt-2 bg-black border rounded-lg border-gray-800"}
              value={amountToReceive}
              type={"number"}
              onChange={(e) =>
                handleAmountInput(e.target.value, setAmountToReceive)
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
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
        </div>
        <div className={"w-full flex flex-col text-xs mt-5"}>
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
            {addressInput.length > 8 && (
              <div className={"flex flex-row  items-center text-gray-800"}>
                {addressFormat(addressInput)}
                <Copy textToCopy={addressInput} />
              </div>
            )}
          </div>
          <div
            className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>from Wallet</span>
            {solanaWallet.publicKey?.toString() && (
              <div className={"flex flex-row  items-center text-gray-800"}>
                {addressFormat(solanaWallet.publicKey!.toString())}

                <Copy textToCopy={solanaWallet.publicKey!.toString()} />
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
          className={"w-full mt-5"}
          disabled={
            !isSolanaWalletConneceted || !isFormFullField
          }
          onClick={() => {
            setStep("transaction")
          }}
        >
          {isSolanaWalletConneceted
            ? isFormFullField
              ? "Sign & Transaction"
              : "Add Destination Wallet Address"
            : "+ Connect SOL (SOL) Wallet"}
        </Button>
        <Button
            className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
            onClick={closeModalHandler}
        >
          Cancel
        </Button>
      </div>
    ),
    transaction: <>
      <div className={"w-full flex flex-col items-center"}>
        <div className={"w-full h-24 flex flex-col justify-center items-center mt-2 text-xs text-white"}>
          <Clock11 className={"w-12 h-12 text-white"}/>
          {/*<CircleCheck />*/}
          {/*<FileWarning />*/}
          <span className={"mt-5"}>Pending Transaction</span>
          <span className={"text-gray-700"}>
you can already view transaction in explorer</span>
        </div>
        <div className={"w-full flex flex-col text-xs mt-5 text-white"}>
          <div
              className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>TX ID</span>
            <div className={"flex flex-row items-center justify-center text-gray-800"}>
              {addressFormat(addressInput)}
              <Copy textToCopy={addressInput}/>
              <ArrowUpRight className={"w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white"}/>
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
            {addressInput.length > 8 && (
                <div className={"flex flex-row items-center text-gray-800"}>
                  {addressFormat(addressInput)}
                  <Copy textToCopy={addressInput}/>
                </div>
            )}
          </div>
          <div
              className={"w-full flex flex-row justify-between items-center my-2"}
          >
            <span>from Wallet</span>
            {solanaWallet.publicKey?.toString() && (
                <div className={"flex flex-row text-gray-800"}>
                  {addressFormat(solanaWallet.publicKey!.toString())}

                  <Copy textToCopy={solanaWallet.publicKey!.toString()}/>
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
          <Redo2 className={"w-5 h-5 mr-2"} /> Retry
          {/*<Clock10 className={"w-5 h-5 mr-2"}/> Proccessing Transaction*/}
        </Button>
      </div>
    </>,
  };

  const walletStepRender = () => {
    return steps[step];
  };

  return (
      <Dialog open={openModal} onOpenChange={(_open) => setOpenModal(_open)}>
        <DialogTrigger asChild>
          <Button className={"bg-white text-black "}>Accept</Button>
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
            <span className={"text-gray-700 text-xs mt-5 text-justify"}>
            The advertiser&apos;s assets are locked. After the transaction is
            successfully completed, the assets will be automatically sent to the
            destination wallet address you provided. Verify all details before
            confirming.
          </span>
          </div>
        </DialogContent>
      </Dialog>
  );
};
