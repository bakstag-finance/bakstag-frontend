import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { offerId, srcAmountLD } = data;

    console.log("Data", data);

    await prisma.order.update({
      where: {
        offerId: offerId,
      },
      data: {
        srcAmountLD: srcAmountLD,
      },
    });

    return NextResponse.json({
      status: 200,
    });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({
      message: e.message,
    });
  }
}
export async function GET() {}
