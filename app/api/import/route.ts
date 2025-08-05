//app/api/inventory/import/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const BATCH_SIZE = 25; // Processar 25 livros por vez
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo de delay entre lotes

// Função helper para aguardar um tempo
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface InventoryBook {
  codFle: string;
  barCode?: string;
  location: string;
  quantity: number;
  coverPrice: number;
  price: number;
  title: string;
  author: string;
  medium: string;
  publisher: string;
  distributor: string;
  subject: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { books } = body;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return NextResponse.json(
        { error: "Dados de importação inválidos" },
        { status: 400 }
      );
    }

    const results = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      created: [] as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updated: [] as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors: [] as any[],
    };

    // Dividir os livros em lotes menores para processamento
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE);

      try {
        // Aguardar um pouco entre os lotes para não sobrecarregar o DB
        if (i > 0) {
          await delay(DELAY_BETWEEN_BATCHES);
        }

        console.log(
          `Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(
            books.length / BATCH_SIZE
          )}`
        );

        // Processar cada lote em uma transação
        const batchResults = await prisma.$transaction(
          async (tx) => {
            const createdInBatch = [];
            const updatedInBatch = [];

            for (const book of batch) {
              try {
                // Verificar se o livro já existe pelo código FLE
                const existing = await tx.inventoryBook.findUnique({
                  where: { codFle: book.codFle },
                });

                if (existing) {
                  // Atualizar o livro existente
                  const updated = await tx.inventoryBook.update({
                    where: { id: existing.id },
                    data: {
                      barCode: book.barCode || existing.barCode,
                      location: book.location || existing.location,
                      // Atualizar quantidade apenas se maior que 0, senão manter existente
                      quantity: book.quantity > 0 ? book.quantity : existing.quantity,
                      coverPrice: book.coverPrice.toString(),
                      price: book.price.toString(),
                      title: book.title,
                      author: book.author || existing.author,
                      medium: book.medium || existing.medium,
                      publisher: book.publisher || existing.publisher,
                      distributor: book.distributor || existing.distributor,
                      subject: book.subject || existing.subject,
                    },
                  });

                  updatedInBatch.push({
                    id: updated.id,
                    codFle: updated.codFle,
                    title: updated.title,
                  });
                } else {
                  // Criar um novo livro no inventário
                  const created = await tx.inventoryBook.create({
                    data: {
                      codFle: book.codFle,
                      barCode: book.barCode,
                      location: book.location || "ESTOQUE",
                      quantity: book.quantity || 0, // Usar quantidade da planilha
                      coverPrice: book.coverPrice.toString(),
                      price: book.price.toString(),
                      title: book.title,
                      author: book.author,
                      medium: book.medium || "Não informado",
                      publisher: book.publisher,
                      distributor: book.distributor || "Não informado",
                      subject: book.subject || "Não informado",
                    },
                  });

                  createdInBatch.push({
                    id: created.id,
                    codFle: created.codFle,
                    title: created.title,
                  });
                }
              } catch (error) {
                console.error(`Erro ao processar livro ${book.codFle}:`, error);
                results.errors.push({
                  codFle: book.codFle,
                  title: book.title,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Erro desconhecido",
                });
              }
            }

            return { created: createdInBatch, updated: updatedInBatch };
          },
          {
            timeout: 15000, // Aumentado para 15 segundos
            maxWait: 20000, // Tempo máximo de espera
          }
        );

        results.created.push(...batchResults.created);
        results.updated.push(...batchResults.updated);

        console.log(
          `Lote ${Math.floor(i / BATCH_SIZE) + 1} processado com sucesso:`,
          `${batchResults.created.length} criados, ${batchResults.updated.length} atualizados`
        );
      } catch (error) {
        console.error(
          `Erro ao processar lote ${Math.floor(i / BATCH_SIZE) + 1}:`,
          error
        );

        // Registrar erros para todo o lote
        results.errors.push(
          ...batch.map((book) => ({
            codFle: book.codFle,
            title: book.title,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          }))
        );

        // Aguardar um pouco mais se houver erro
        await delay(DELAY_BETWEEN_BATCHES * 2);
      }
    }

    // Garantir que sempre temos arrays válidos na resposta
    const finalResults = {
      created: results.created || [],
      updated: results.updated || [],
      errors: results.errors || [],
      success: [...(results.created || []), ...(results.updated || [])]
    };

    console.log("Resultado final:", {
      created: finalResults.created.length,
      updated: finalResults.updated.length,
      errors: finalResults.errors.length,
      success: finalResults.success.length
    });

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${finalResults.created.length} livros criados, ${finalResults.updated.length} livros atualizados, ${finalResults.errors.length} erros.`,
      results: finalResults,
    });
  } catch (error) {
    console.error("Erro ao importar livros para o catálogo:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao importar livros";

    // Retornar estrutura consistente mesmo em caso de erro
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao importar livros",
        message: errorMessage,
        results: {
          created: [],
          updated: [],
          errors: [],
          success: []
        }
      },
      { status: 500 }
    );
  }
}
