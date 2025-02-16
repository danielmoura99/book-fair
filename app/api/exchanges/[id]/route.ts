//app/api/exchanges/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const transactionDate = new Date(body.date);
    transactionDate.setHours(12);

    const result = await prisma.$transaction(async (tx) => {
      const exchange = await tx.transaction.findUnique({
        where: { id: params.id },
        include: { book: true, payments: true },
      });

      if (!exchange) {
        throw new Error("Troca não encontrada");
      }

      // Reverter estoques anteriores
      await tx.book.update({
        where: { id: exchange.returnedBookId! },
        data: { quantity: { decrement: 1 } },
      });

      await tx.book.update({
        where: { id: exchange.bookId },
        data: { quantity: { increment: 1 } },
      });

      // Atualizar com novos valores
      await tx.book.update({
        where: { id: body.returnedBookId },
        data: { quantity: { increment: 1 } },
      });

      await tx.book.update({
        where: { id: body.newBookId },
        data: { quantity: { decrement: 1 } },
      });

      // Atualizar ou criar pagamento
      if (exchange.payments[0]) {
        await tx.payment.update({
          where: { id: exchange.payments[0].id },
          data: {
            method: body.paymentMethod || "EXCHANGE",
            amount: String(Math.abs(body.priceDifference || 0)),
          },
        });
      } else {
        await tx.payment.create({
          data: {
            transactionId: params.id,
            method: body.paymentMethod || "EXCHANGE",
            amount: String(Math.abs(body.priceDifference || 0)),
          },
        });
      }

      const transaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          bookId: body.newBookId,
          returnedBookId: body.returnedBookId,
          totalAmount: String(Math.abs(body.priceDifference || 0)),
          priceDifference: String(body.priceDifference || 0),
          transactionDate,
        },
        include: {
          book: true,
          payments: true,
        },
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao atualizar troca",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const exchange = await tx.transaction.findUnique({
        where: { id: params.id },
        include: { payments: true },
      });

      if (!exchange) {
        throw new Error("Troca não encontrada");
      }

      // Deletar pagamentos primeiro
      if (exchange.payments.length > 0) {
        await tx.payment.deleteMany({
          where: { transactionId: params.id },
        });
      }

      // Reverter estoques
      await tx.book.update({
        where: { id: exchange.returnedBookId! },
        data: { quantity: { decrement: 1 } },
      });

      await tx.book.update({
        where: { id: exchange.bookId },
        data: { quantity: { increment: 1 } },
      });

      // Deletar transação
      await tx.transaction.delete({
        where: { id: params.id },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao cancelar troca",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
