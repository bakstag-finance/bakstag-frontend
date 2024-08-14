import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      offerId,
      dstSellerAddress,
      dstEid,
      srcTokenAddress,
      srcTokenTicker,
      srcTokenNetwork,
      dstTokenAddress,
      dstTokenTicker,
      dstTokenNetwork,
      srcAmountLD,
      exchangeRateSD,
    } = data;

    const _prev = await prisma.order.findFirst({
      where: {
        offerId: offerId,
      },
    });

    if (_prev) {
      return NextResponse.json({
        status: 200,
        objects: [],
      });
    }

    await prisma.order.create({
      data: {
        offerId,
        srcSellerAddress: "",
        dstSellerAddress,
        dstEid: parseInt(dstEid),
        srcTokenTicker,
        srcTokenNetwork,
        srcTokenAddress,
        dstTokenTicker,
        dstTokenNetwork,
        dstTokenAddress,
        srcAmountLD: BigInt(srcAmountLD),
        exchangeRateSD: BigInt(exchangeRateSD),
      },
    });

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
export async function GET() {}
