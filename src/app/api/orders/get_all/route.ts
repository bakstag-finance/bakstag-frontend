import { tokensData } from "@/lib/constants";
import { hexZeroPadTo32 } from "@/lib/helpers";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tokenToBuy = searchParams.get("tokenToBuy") || "";
    const amountToBuy = searchParams.get("amountToBuy") || "";
    const tokenToSell = searchParams.get("tokenToSell") || "";
    const srcAddress = searchParams.get("address") || "";

    const amountToBuyInSmallestUnit = BigInt(
      Math.floor(parseFloat(amountToBuy) * 1e18),
    );
    const whereCondition: any = {};

    if (srcAddress && srcAddress.length > 0) {
      whereCondition.srcSellerAddress = hexZeroPadTo32(srcAddress as any);
    }

    if (tokenToBuy && tokensData[tokenToBuy]) {
      whereCondition.dstTokenTicker = tokensData[tokenToBuy].token;
      whereCondition.dstTokenNetwork = tokensData[tokenToBuy].network;
    }

    if (tokenToSell && tokensData[tokenToSell]) {
      whereCondition.srcTokenTicker = tokensData[tokenToSell].token;
      whereCondition.srcTokenNetwork = tokensData[tokenToSell].network;
    }

    const result = await prisma.order.findMany({
      where: whereCondition,
    });

    const filteredOrders = result.filter((order) => {
      return BigInt(order.exchangeRateSD) >= amountToBuyInSmallestUnit;
    });

    const orders = filteredOrders.map((order) => ({
      ...order,
      srcAmountLD: order.srcAmountLD.toString(),
      exchangeRateSD: order.exchangeRateSD.toString(),
    }));

    return NextResponse.json({
      status: 200,
      orders,
    });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({
      message: e.message,
    });
  }
}
