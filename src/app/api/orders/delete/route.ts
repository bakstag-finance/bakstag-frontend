import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      offerId,
    } = data;
    const _result = await prisma.order.delete({
        where: {
            offerId: offerId
        }
    });

    return NextResponse.json({
      status: 200,
      objects: _result,
    });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({
      message: e.message,
    });
  }
}
export async function GET() {}
