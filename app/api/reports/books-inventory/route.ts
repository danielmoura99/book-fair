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

    // ✅ BUSCAR TODOS os livros (vamos filtrar depois do cálculo de vendas)
    const booksWithSales = await prisma.book.findMany({
      where: {
        // ✅ FILTRO: Excluir livros com location "N disponível"
        location: {
          not: "N disponível",
        },
        // ❌ REMOVIDO: quantity > 0 (vamos filtrar depois)
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
            transactionDate: true,
          },
          orderBy: {
            transactionDate: "desc", // Mais recente primeiro
          },
        },
      },
      orderBy: {
        title: "asc",
      },
      // ✅ LIMITAÇÃO: Evitar timeout com muitos registros
      take: 10000,
    });

    // ✅ CALCULAR vendas, data da última venda e identificar esgotados
    const result = booksWithSales
      .map((book) => {
        const quantitySold = book.transactions.reduce(
          (sum, transaction) => sum + transaction.quantity,
          0
        );

        // Encontrar a data da última venda
        const lastSaleDate = book.transactions.length > 0 
          ? book.transactions[0].transactionDate // Primeiro da lista (mais recente)
          : null;

        // Verificar se o livro está esgotado (sem estoque mas com vendas)
        const isOutOfStock = book.quantity === 0 && quantitySold > 0;

        return {
          codFle: book.codFle,
          title: book.title,
          publisher: book.publisher,
          distributor: book.distributor,
          quantity: book.quantity,
          quantitySold,
          lastSaleDate,
          isOutOfStock,
          // ✅ NOVA FUNCIONALIDADE: Data que esgotou (se aplicável)
          soldOutDate: isOutOfStock ? lastSaleDate : null,
        };
      })
      .filter((book) => {
        // ✅ NOVA LÓGICA: Mostrar se TEM ESTOQUE OU já foi VENDIDO
        // Só filtrar quando AMBOS estão zerados (estoque = 0 AND vendidos = 0)
        return book.quantity > 0 || book.quantitySold > 0;
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
            // ✅ APLICAR mesma lógica: buscar todos para depois filtrar
            OR: [
              { quantity: { gt: 0 } }, // Com estoque
              // Em caso de fallback, não conseguimos calcular vendas facilmente
              // então vamos confiar apenas no estoque
            ],
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
