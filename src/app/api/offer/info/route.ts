import { NextResponse } from "next/server";
import { waitForMessageReceived } from "@layerzerolabs/scan-client";

const MessageStatus = {
  INFLIGHT: "INFLIGHT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
};

export const dynamic = "force-dynamic";

export async function POST() {}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const srcEid = searchParams.get("srcEid");
    const txHash = searchParams.get("txHash");

    if (!srcEid) {
      throw new Error("No Eid provided");
    }

    if (!txHash) {
      throw new Error("No TxHash provided");
    }

    const _srcEid = Number(srcEid);

    await waitForMessageReceived(_srcEid, txHash, 300);

    return NextResponse.json({
      status: 200,
      objects: [],
    });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({
      message: e.message,
    });
  }
}
