import { Copy, Button } from "@/components/ui"
import { Trash, ArrowUpRight } from "lucide-react"

export const DeletingStep = () => {
    return (
        <div className="w-full flex flex-col justify-start items-center text-sm text-white">
        <div className="flex flex-col items-center h-[200px]">
          <Trash className="w-20 h-20 stroke-[0.5]" />
          <span className="text-center mt-2">
            Are You Sure about Terminating this Ad?
          </span>
          <span className="text-gray-700 text-xs text-center">
            this action is irreversible. Make a confident decision
          </span>
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <div className="w-full flex flex-row justify-between items-center">
            <span>Ad TX ID</span>
            <div
              className={
                "flex flex-row items-center justify-center text-gray-700"
              }
            >
              0xc7...b5e6
              <Copy
                textToCopy={"0xd015684B421CBED3bCfA19643d01F51Bc72a4503"}
              />
              <ArrowUpRight
                className={
                  "w-5 h-5 ml-1 text-gray-700 cursor-pointer hover:text-white"
                }
              />
            </div>
          </div>
          <div className="mt-5 w-full flex flex-row justify-between items-center">
            <span>Avaliable Amount</span>
            <span>
              200 ETH <span className="text-gray-700">(BASE)</span>
            </span>
          </div>
          <div className="mt-5 w-full flex flex-row justify-between items-center">
            <span>from wallet</span>
            <div
              className={
                "flex flex-row items-center justify-center text-gray-800"
              }
            >
              0xc7...b5e6
              <Copy
                textToCopy={"0xd015684B421CBED3bCfA19643d01F51Bc72a4503"}
              />
            </div>
          </div>
          <div className="mt-5 w-full flex flex-row justify-between items-center">
            <span>Exchange Rate</span>
            <span>
              22.154 <span className="text-gray-700">SOL</span> = 1 ETH
            </span>
          </div>
        </div>
        <Button className="w-full mt-5 font-light">
          Sign & Terminate
        </Button>
      </div>
    )
}
