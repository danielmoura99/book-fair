//app/api/exchanges/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Surrogate-Control", "no-store");

    const body = await req.json();
    const transactionDate = new Date();
    transactionDate.setHours(12);

    // Verificar se existe um caixa aberto
    const activeCashRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeCashRegister) {
      return NextResponse.json(
        { error: "Não há caixa aberto para registrar a troca" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Verificar livro devolvido
      const returnedBook = await tx.book.findUnique({
        where: { id: body.returnedBookId },
      });

      // Verificar novo livro
      const newBook = await tx.book.findUnique({
        where: { id: body.newBookId },
      });

      if (!returnedBook || !newBook) {
        throw new Error("Livro não encontrado");
      }

      if (newBook.quantity < 1) {
        throw new Error("Livro para troca sem estoque");
      }

      // ✅ CORRIGIDO: Atualizar estoque do livro devolvido (+1)
      await tx.book.update({
        where: { id: body.returnedBookId },
        data: { quantity: { increment: 1 } },
      });

      // ✅ CORRIGIDO: Atualizar estoque do novo livro (-1)
      await tx.book.update({
        where: { id: body.newBookId },
        data: { quantity: { decrement: 1 } },
      });

      // ✅ CORRIGIDO: Calcular diferença corretamente
      const priceDifference =
        Number(newBook.coverPrice) - Number(returnedBook.coverPrice);

      // ✅ CORRIGIDO: Registrar transação de troca
      const transaction = await tx.transaction.create({
        data: {
          type: "EXCHANGE",
          bookId: body.newBookId, // ✅ Livro principal é o NOVO
          returnedBookId: body.returnedBookId, // ✅ Livro devolvido
          quantity: 1,
          totalAmount: String(priceDifference), // ✅ DIFERENÇA (pode ser positiva ou negativa)
          priceDifference: String(priceDifference),
          transactionDate,
          cashRegisterId: activeCashRegister.id,
          operatorName: body.operatorName || "SISTEMA", // ✅ USAR OPERADOR ENVIADO
          // ✅ CORRIGIDO: Pagamento de troca
          payments: {
            create: [
              {
                method: "EXCHANGE", // ✅ Identificar como TROCA
                amount: String(Math.abs(priceDifference)), // ✅ Valor absoluto
                // Se priceDifference for negativo, é o cliente que recebe
                change:
                  priceDifference < 0 ? String(Math.abs(priceDifference)) : "0",
              },
            ],
          },
        },
        include: {
          book: true,
          payments: true,
        },
      });

      return {
        transaction,
        returnedBook,
        newBook,
        priceDifference,
      };
    });

    const { transaction, returnedBook, newBook, priceDifference } = result;

    let message = `Troca processada: "${returnedBook.title}" por "${newBook.title}"`;

    if (priceDifference > 0) {
      message += ` (cliente paga R$ ${priceDifference.toFixed(2)})`;
    } else if (priceDifference < 0) {
      message += ` (cliente recebe R$ ${Math.abs(priceDifference).toFixed(2)})`;
    } else {
      message += ` (sem diferença de valor)`;
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message,
        data: transaction,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Erro ao processar troca:", error);

    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    return new NextResponse(
      JSON.stringify({
        error: "Erro ao processar troca",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}
