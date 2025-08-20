//app/api/reports/cash-closing/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Surrogate-Control", "no-store");

    const closedRegisters = await prisma.cashRegister.findMany({
      where: {
        status: "CLOSED",
      },
      orderBy: {
        closingDate: "desc",
      },
      include: {
        transactions: {
          include: {
            book: true,
            payments: true,
          },
        },
        withdrawals: true,
      },
    });

    const closingsWithSummary = closedRegisters.map((register) => {
      // Agrupa pagamentos por método
      const paymentSummary = register.transactions
        .flatMap((t) => t.payments || [])
        .reduce((acc, payment) => {
          const method = payment.method;
          if (!acc[method]) {
            acc[method] = { total: 0, count: 0 };
          }
          acc[method].total += Number(payment.amount);
          acc[method].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

      // Calcula totais
      const totalSales = register.transactions.reduce(
        (sum, t) => sum + Number(t.totalAmount),
        0
      );

      const totalWithdrawals = register.withdrawals.reduce(
        (sum, w) => sum + Number(w.amount),
        0
      );

      // Calcular total de livros vendidos no dia
      const totalBooksSold = register.transactions.reduce(
        (sum, t) => sum + t.quantity,
        0
      );

      const formattedWithdrawals = register.withdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        reason: w.reason,
        operatorName: w.operatorName || "Sistema", // Valor padrão caso não tenha operador
        createdAt: w.createdAt.toISOString(),
      }));

      // Formata as transações  
      const formattedTransactions = register.transactions.map((t) => ({
        id: t.id,
        transactionDate: t.transactionDate.toISOString(),
        book: {
          id: t.book.id,
          title: t.book.title,
          codFle: t.book.codFle,
        },
        quantity: t.quantity,
        totalAmount: Number(t.totalAmount),
        type: t.type,
        operatorName: t.operatorName,
        payments: t.payments.map((p) => ({
          id: p.id,
          method: p.method,
          amount: Number(p.amount),
          amountReceived: p.amountReceived
            ? Number(p.amountReceived)
            : undefined,
          change: p.change ? Number(p.change) : undefined,
        })),
      }));

      return {
        id: register.id,
        date:
          register.closingDate?.toISOString() ||
          register.createdAt.toISOString(),
        initialAmount: Number(register.initialAmount),
        finalAmount: Number(register.finalAmount || 0),
        totalSales,
        totalWithdrawals,
        totalBooksSold, // ✅ NOVO CAMPO
        paymentMethods: Object.entries(paymentSummary).map(
          ([method, data]) => ({
            method,
            total: data.total,
            count: data.count,
          })
        ),
        transactions: formattedTransactions,
        withdrawals: formattedWithdrawals,
      };
    });

    return new NextResponse(JSON.stringify(closingsWithSummary), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Erro ao buscar relatório de fechamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatório de fechamento" },
      { status: 500 }
    );
  }
}
