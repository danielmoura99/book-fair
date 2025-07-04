// app/api/reports/books-inventory/route.ts
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

    // ✅ OTIMIZAÇÃO: Uma única query com JOIN em vez de loop
    const booksWithSales = await prisma.book.findMany({
      where: {
        // ✅ FILTRO: Excluir livros com location "N disponível"
        location: {
          not: "N disponível",
        },
        // ✅ FILTRO OPCIONAL: Incluir apenas livros com quantidade > 0
        quantity: {
          gt: 0,
        },
      },
      select: {
        id: true,
        codFle: true,
        title: true,
        publisher: true,
        distributor: true,
        quantity: true,
        // ✅ OTIMIZAÇÃO: Buscar transações relacionadas de uma vez
        transactions: {
          where: {
            type: "SALE",
          },
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        title: "asc",
      },
      // ✅ LIMITAÇÃO: Evitar timeout com muitos registros
      take: 10000,
    });

    // ✅ OTIMIZAÇÃO: Calcular vendas em memória em vez de novas queries
    const result = booksWithSales.map((book) => {
      const quantitySold = book.transactions.reduce(
        (sum, transaction) => sum + transaction.quantity,
        0
      );

      return {
        codFle: book.codFle,
        title: book.title,
        publisher: book.publisher,
        distributor: book.distributor,
        quantity: book.quantity,
        quantitySold,
      };
    });

    console.log(`📊 Relatório gerado: ${result.length} livros processados`);

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar relatório de estoque:", error);

    // ✅ TRATAMENTO: Tentar consulta mais simples em caso de erro
    if (error instanceof Error && error.message.includes("timeout")) {
      try {
        console.log("⚠️ Timeout detectado, tentando consulta simplificada...");

        // Consulta de fallback mais simples
        const simpleBooks = await prisma.book.findMany({
          where: {
            location: {
              not: "N disponível",
            },
            quantity: {
              gt: 0,
            },
          },
          select: {
            codFle: true,
            title: true,
            publisher: true,
            distributor: true,
            quantity: true,
          },
          orderBy: {
            title: "asc",
          },
          take: 500, // Limite menor para fallback
        });

        const fallbackResult = simpleBooks.map((book) => ({
          ...book,
          quantitySold: 0, // Em caso de erro, não calcular vendas
        }));

        console.log(
          `📊 Fallback: ${fallbackResult.length} livros (sem cálculo de vendas)`
        );

        return NextResponse.json(fallbackResult);
      } catch (fallbackError) {
        console.error("❌ Erro no fallback:", fallbackError);
        return NextResponse.json(
          { error: "Erro ao buscar relatório de estoque - timeout" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erro ao buscar relatório de estoque" },
      { status: 500 }
    );
  }
}
