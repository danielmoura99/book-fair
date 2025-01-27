import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await prisma.cashRegister.create({
      data: {
        openingDate: new Date(),
        initialAmount: body.initialAmount,
        notes: body.notes,
        status: "OPEN",
      },
    });
    return NextResponse.json(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Erro ao abrir caixa" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const activeRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
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
    return NextResponse.json(activeRegister);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar caixa" },
      { status: 500 }
    );
  }
}
