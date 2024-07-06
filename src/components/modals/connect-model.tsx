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
} from "@/components/ui";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { LogOut, Trash } from "lucide-react";
import { addressFormat } from "@/lib/helpers";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  PhantomWalletName,
} from "@solana/wallet-adapter-wallets";

export const ConnectModal = () => {
  const [openModal, setOpenModal] = useState(false);

  const solanaConnect = useConnection();

  const solanaWallet = useWallet();
  console.log(
    "Solana account info",
    solanaWallet.publicKey &&
      solanaConnect.connection.getAccountInfo(solanaWallet.publicKey!),
  );
  const { connect, status, error, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const account = useAccount();

  const isWalletConnected = !!account.address;
  console.log("IsWalletConnected", isWalletConnected);

  const metamaskWalletHandler = async () => {
    if (!account.address) {
      await connect({ connector: metaMask() });
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
    }
  };

  const cancelHandler = () => setOpenModal(false);

  return (
    <Dialog open={openModal} onOpenChange={(_open) => setOpenModal(_open)}>
      <DialogTrigger asChild>
        <Button className={"bg-white text-black w-full"}> + Connect</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <div className={"w-full flex justify-center items-center p-5"}>
          <Tabs
            defaultValue="wallet"
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
                <div className="my-2 border border-white border-opacity-50 rounded-xl flex w-full h-20 justify-between items-center px-10">
                  <p className="text-white">
                    {isWalletConnected
                      ? addressFormat(account.address!)
                      : "Ethereum"}
                  </p>
                  <Button onClick={metamaskWalletHandler}>
                    {isWalletConnected ? <LogOut /> : "Connect"}
                  </Button>
                </div>
                <div className="my-2 border border-white border-opacity-50 rounded-xl flex w-full h-20 justify-between items-center px-10">
                  <p className="text-white">
                    {solanaWallet.connected
                      ? addressFormat(solanaWallet.publicKey!.toString())
                      : "Solana"}
                  </p>
                  <Button onClick={solanaWalletHandler}>
                    {isWalletConnected ? <LogOut /> : "Connect"}
                  </Button>
                </div>
                <div className="my-2 border border-white border-opacity-50 rounded-xl flex w-full h-10 justify-between items-center px-10">
                  <p className="text-white">Tron (in development )</p>
                </div>
                <Button
                  className="w-ful my-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
                  onClick={cancelHandler}
                >
                  Cancel
                </Button>
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
                        <SelectItem value="usdc-opt">
                          USDC (Optimism)
                        </SelectItem>
                        <SelectItem value="usdt-opt">
                          USDC (Optimism)
                        </SelectItem>
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
                    <SelectTrigger
                      className="w-full ml-2"
                      defaultValue={"most"}
                    >
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
              <Button className="w-full mt-5">+ Create Add</Button>
              <Button
                className="w-full mt-5 bg-black text-gray-700 border border-white border-opacity-50 hover:bg-gray-800"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
