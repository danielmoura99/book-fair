import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const result = await prisma.cashRegister.update({
      where: { id: params.id },
      data: {
        closingDate: new Date(),
        finalAmount: body.finalAmount,
        notes: body.notes,
        status: "CLOSED",
      },
    });
    return NextResponse.json(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao fechar caixa" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const register = await prisma.cashRegister.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          include: { book: true },
          orderBy: { createdAt: "desc" },
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json(register);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar caixa" },
      { status: 500 }
    );
  }
}
