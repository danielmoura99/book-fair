//app/api/operators/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const operators = await prisma.operator.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(operators);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar operadores" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const operator = await prisma.operator.create({
      data: {
        name: body.name,
      },
    });
    return NextResponse.json(operator);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar operador" },
      { status: 500 }
    );
  }
}
