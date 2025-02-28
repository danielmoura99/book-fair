import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const result = await prisma.cashWithdrawal.create({
      data: {
        amount: body.amount,
        reason: body.reason,
        operatorName: body.operatorName,
        cashRegisterId: params.id,
      },
    });
    return NextResponse.json(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao registrar retirada" },
      { status: 500 }
    );
  }
}
