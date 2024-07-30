import { tokensData } from "@/lib/constants";
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

    console.log("TOKENToBUY", tokenToBuy);
    console.log("AMOUNTTOBUY", amountToBuy);
    console.log("TokenToSell", tokenToSell);

    const amountToBuyInSmallestUnit = BigInt(
      Math.floor(parseFloat(amountToBuy) * 1e18),
    );

    const whereCondition: any = {};

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
