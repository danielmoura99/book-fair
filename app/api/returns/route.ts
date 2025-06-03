//app/api/returns/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transactionDate = new Date();
    transactionDate.setHours(12);

    // Verificar se existe um caixa aberto
    const activeCashRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeCashRegister) {
      return NextResponse.json(
        { error: "Não há caixa aberto para registrar a devolução" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Verificar livro devolvido
      const returnedBook = await tx.book.findUnique({
        where: { id: body.returnedBookId },
      });

      if (!returnedBook) {
        throw new Error("Livro não encontrado");
      }

      // ✅ CORRIGIDO: Incrementar estoque do livro devolvido
      await tx.book.update({
        where: { id: body.returnedBookId },
        data: { quantity: { increment: 1 } },
      });

      const returnValue = Number(returnedBook.coverPrice);

      // ✅ CORRIGIDO: Registrar transação de devolução com valores corretos
      const transaction = await tx.transaction.create({
        data: {
          type: "EXCHANGE", // Manter como EXCHANGE para compatibilidade
          bookId: body.returnedBookId,
          quantity: 1,
          totalAmount: String(-returnValue), // ✅ VALOR NEGATIVO
          priceDifference: String(-returnValue), // ✅ NEGATIVO = devolução
          transactionDate,
          cashRegisterId: activeCashRegister.id,
          operatorName: body.operatorName || "SISTEMA", // ✅ USAR OPERADOR ENVIADO
          // ✅ CORRIGIDO: Pagamento de devolução
          payments: {
            create: [
              {
                method: "EXCHANGE", // ✅ USAR "EXCHANGE" para identificar devolução
                amount: String(returnValue), // Valor absoluto no pagamento
                change: "0",
              },
            ],
          },
        },
        include: {
          book: true,
          payments: true,
        },
      });

      return transaction;
    });

    return NextResponse.json({
      success: true,
      message: `Devolução do livro "${result.book.title}" processada com sucesso`,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao processar devolução:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar devolução",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
