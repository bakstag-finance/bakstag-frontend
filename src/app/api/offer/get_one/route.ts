import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get("offerId") || undefined;

    const result = await prisma.order.findUnique({
      where: {
        offerId: offerId,
      },
    });

    return NextResponse.json({
      status: 200,
      object: result,
    });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({
      message: e.message,
    });
  }
}
