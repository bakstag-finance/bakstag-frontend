import { tokensData } from "@/lib/constants";
import { hexZeroPadTo32 } from "@/lib/helpers";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";
import { parseUnits } from "viem";

export const dynamic = "force-dynamic";

export async function POST() {}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tokenToBuy = searchParams.get("tokenToBuy") || "";
    const amountToBuy = searchParams.get("amountToBuy") || "";
    const tokenToSell = searchParams.get("tokenToSell") || "";
    const srcAddress = searchParams.get("address") || "";
    const showEmpty = searchParams.get("showEmpty") || "";

    const amountToBuyInSmallestUnit = parseUnits(amountToBuy, 18);

    const whereCondition: any = {};

    if (srcAddress && srcAddress.length > 0) {
      if (srcAddress === "undefined") {
        return NextResponse.json({
          status: 200,
          orders: [],
        });
      }

      whereCondition.srcSellerAddress = hexZeroPadTo32(srcAddress as any);
    }

    if (tokenToBuy && tokensData[tokenToBuy]) {
      whereCondition.srcTokenTicker = tokensData[tokenToBuy].token;
      whereCondition.srcTokenNetwork = tokensData[tokenToBuy].network;
    }

    if (tokenToSell && tokensData[tokenToSell]) {
      whereCondition.dstTokenTicker = tokensData[tokenToSell].token;
      whereCondition.dstTokenNetwork = tokensData[tokenToSell].network;
    }

    console.log("WhereCondition", whereCondition);
    const result = await prisma.order.findMany({
      where: whereCondition,
    });

    const filteredOrders = result.filter((order) => {
      const isOrderEmpty = BigInt(order.srcAmountLD) === BigInt(0);
      const isValidAmount =
        BigInt(order.srcAmountLD) >= amountToBuyInSmallestUnit;

      if (showEmpty === "true") {
        return isValidAmount;
      } else {
        return !isOrderEmpty && isValidAmount;
      }
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
