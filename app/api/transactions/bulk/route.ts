//app/api/transactions/bulk/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items, totalAmount, operatorName, payments, date } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Itens da venda são obrigatórios" },
        { status: 400 }
      );
    }

    const transactionDate = new Date(date);
    transactionDate.setHours(12);

    // Verificar se existe um caixa aberto
    const activeCashRegister = await prisma.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    if (!activeCashRegister) {
      return NextResponse.json(
        { error: "Não há caixa aberto para registrar a venda" },
        { status: 400 }
      );
    }

    // Usar transação do Prisma para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      const createdTransactions = [];

      // Verificar estoque de todos os livros antes de processar
      for (const item of items) {
        const book = await tx.book.findUnique({
          where: { id: item.bookId },
        });

        if (!book) {
          throw new Error(`Livro não encontrado: ${item.bookId}`);
        }

        if (book.quantity < item.quantity) {
          throw new Error(
            `Quantidade insuficiente em estoque para o livro: ${book.title}`
          );
        }
      }

      // ✅ CORRIGIDO: Gerar um ID único para o grupo de venda
      const saleGroupId = `sale_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Processar cada item da venda
      for (const item of items) {
        // Atualizar o estoque do livro
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        // ✅ CORRIGIDO: Criar transação SEM forçar sequentialId
        const transaction = await tx.transaction.create({
          data: {
            // sequentialId será auto-incrementado automaticamente
            saleGroupId: saleGroupId, // ✅ MESMO grupo para toda a venda
            bookId: item.bookId,
            quantity: item.quantity,
            totalAmount: item.itemTotal,
            transactionDate: transactionDate,
            cashRegisterId: activeCashRegister.id,
            type: "SALE",
            operatorName: operatorName,
          },
          include: {
            book: true,
          },
        });

        createdTransactions.push(transaction);
      }

      // ✅ Criar os pagamentos vinculados à PRIMEIRA transação
      if (payments && payments.length > 0) {
        const firstTransaction = createdTransactions[0];

        for (const payment of payments) {
          await tx.payment.create({
            data: {
              transactionId: firstTransaction.id,
              method: payment.method,
              amount: payment.amount.toString(),
              amountReceived: payment.amountReceived
                ? payment.amountReceived.toString()
                : null,
              change: payment.change ? payment.change.toString() : null,
            },
          });
        }
      }

      return {
        transactions: createdTransactions,
        saleGroupId: saleGroupId,
        totalItems: items.length,
        firstSequentialId: createdTransactions[0].sequentialId,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Venda registrada com sucesso (${result.totalItems} itens)`,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar venda",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
