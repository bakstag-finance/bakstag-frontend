"use client";

import { Button, Input, SelectCoin } from "@/components/ui";
import { AcceptModal, ConnectModal, CreateModal } from "@/components/modals";
import { useQuery } from "@tanstack/react-query";
import { Clock10 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    data: tableData,
    isError,
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["ads"],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = Array.from(Array(10));
          resolve(result);
        }, 3000);
      });
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-black text-white py-10 lg:py-12 px-5 lg:px-0">
      <div className={"w-full max-w-[785px]"}>
        <div
          className={
            "flex w-full lg:h-20 justify-between items-center mb-5 lg:mb-0"
          }
        >
          <div
            className={
              "flex flex-col-reverse lg:flex-row w-full justify-between"
            }
          >
            <div className={"flex flex-col w-full mt-5 lg:mt-0"}>
              <label>Token to Buy</label>
              <SelectCoin
                placeholder={"Token to Buy"}
                value={""}
                setValue={(s) => {}}
              />
            </div>
            <div className={"flex flex-col w-full lg:pl-5"}>
              <label>Exchange Rate</label>
              <Input className={"bg-black border rounded-lg border-gray-800"} />
            </div>
          </div>
          <div
            className={"flex flex-col-reverse lg:flex-row w-full ml-3 lg:ml-0"}
          >
            <div className={"flex flex-col w-full lg:pl-5 mt-5 lg:mt-0"}>
              <label>Token to Sell</label>
              <SelectCoin
                placeholder={"Token to Sell"}
                value={""}
                setValue={(s) => {}}
              />
            </div>
            <div
              className={
                "px-0 mt-6 flex justify-center items-center h-full w-full lg:pl-5"
              }
            >
              <ConnectModal />
            </div>
          </div>
        </div>
        <div
          className={cn(
            `mt-5 w-full min-h-screen border border-gray-800 rounded-xl flex justify-center items-start`,
            (isLoading || isError) && "h-[425px]",
          )}
        >
          <div className={"w-full h-full"}>
            <div
              className={
                "hidden border-b border-gray-800 w-full lg:flex justify-center"
              }
            >
              <div
                className={
                  "p-5 w-[95%] flex justify-around items-center h-10 text-gray-700"
                }
              >
                <span>Advertiser</span>
                <span>Exchange Rate</span>
                <span>Max Amount</span>
                <span>Trade</span>
              </div>
            </div>
            {isLoading && (
              <div
                className={"flex justify-center items-center h-full my-full"}
              >
                <Button variant={"secondary"}>
                  <Clock10 className={"w-5 h-5 mr-2"} /> Fetching Ads
                </Button>
              </div>
            )}

            {isError && (
              <div
                className={"flex justify-center items-center h-full my-full"}
              >
                <Button variant={"destructive"} onClick={() => refetch()}>
                  Fatching Failed (Retry)
                </Button>
              </div>
            )}

            {tableData &&
              tableData.map((_: any, i: number) => (
                <>
                  <div className={"lg:hidden"}>
                    <div
                      className={
                        "flex flex-row items-end justify-center text-white h-32 border-b  border-gray-800 px-5 py-3"
                      }
                      key={`offer-mb-${i}`}
                    >
                      <div
                        className={
                          "flex w-full h-full flex-col justify-between"
                        }
                      >
                        <span className={"text-sm"}>0x71...976f</span>
                        <span className={"font-semibold"}>
                          0.22 <span className={"text-gray-700"}>SOL</span>
                        </span>
                        <div className={"flex flex-col"}>
                          <span className={"text-sm text-gray-700"}>
                            Max Amount:
                          </span>
                          <span>11.865 ETH (Base)</span>
                        </div>
                      </div>
                      <>
                        <AcceptModal />
                      </>
                    </div>
                  </div>

                  <div className={"hidden lg:block"}>
                    <div
                      className={"flex justify-around items-center h-20"}
                      key={`offer-${i}`}
                    >
                      <div
                        className={
                          "p-5 w-[95%] flex justify-around items-center border-b border-gray-800"
                        }
                      >
                        <span>0x71...976f</span>
                        <span>0.22 SOL</span>
                        <span>11.865 ETH (Base)</span>
                        <AcceptModal />
                      </div>
                    </div>
                  </div>
                </>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
