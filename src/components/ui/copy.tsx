"use client";
import useCopyToClipboard from "@/lib/hooks/use-copy-to-clipboard";
import { Check, Copy as CopyIcon } from "lucide-react";

interface Props {
  textToCopy: string;
}

export const Copy = ({ textToCopy }: Props) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <>
      <div onClick={() => copyToClipboard(textToCopy)} className={"ml-2"}>
        {isCopied ? (
          <div
            className={
              "w-5 h-5 border border-green-300 flex items-center justify-center rounded-md"
            }
          >
            <Check className={"w-3 h-3 text-green-300"} />
          </div>
        ) : (
          <CopyIcon className={"w-4 h-4 text-gray-700 cursor-pointer hover:text-white"} />
        )}
      </div>
    </>
  );
};
