//app/api/books/batch/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const BATCH_SIZE = 25; // Reduzido para 25 livros por vez
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo de delay entre lotes

// Função helper para aguardar um tempo
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Book {
  codFle: string;
  quantity: number;
  coverPrice: number;
  price: number;
  title: string;
  publisher?: string;
  distributor?: string;
  subject?: string;
  barCode?: string;
}

export async function POST(req: Request) {
  try {
    const { books } = (await req.json()) as { books: Book[] };
    const results = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success: [] as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors: [] as any[],
    };

    // Divide os livros em lotes menores
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE);

      try {
        // Aguarda um pouco antes de processar o próximo lote
        if (i > 0) {
          await delay(DELAY_BETWEEN_BATCHES);
        }

        console.log(
          `Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(
            books.length / BATCH_SIZE
          )}`
        );

        // Processa cada lote em uma nova transação
        const batchResults = await prisma.$transaction(
          async (tx) => {
            const batchProcessed = [];

            for (const book of batch) {
              try {
                let bookToProcess = null;

                // Verifica se já existe um livro com o mesmo codFle
                const existing = await tx.book.findUnique({
                  where: { codFle: book.codFle },
                });

                if (existing) {
                  // Atualiza o livro existente
                  bookToProcess = await tx.book.update({
                    where: { id: existing.id },
                    data: {
                      quantity: {
                        increment: book.quantity, // Usa increment para evitar race conditions
                      },
                      coverPrice: book.coverPrice,
                      price: book.price,
                      title: book.title,
                      publisher: book.publisher || existing.publisher,
                      distributor: book.distributor || existing.distributor,
                      subject: book.subject || existing.subject,
                      barCode: book.barCode || existing.barCode,
                      author: existing.author,
                      medium: existing.medium,
                      location: existing.location,
                    },
                  });
                } else {
                  // Cria um novo livro
                  bookToProcess = await tx.book.create({
                    data: {
                      codFle: book.codFle,
                      title: book.title,
                      quantity: book.quantity,
                      coverPrice: book.coverPrice,
                      price: book.price,
                      publisher: book.publisher || "",
                      distributor: book.distributor || "",
                      subject: book.subject || "",
                      barCode: book.barCode,
                      author: "Não informado",
                      medium: "Não informado",
                      location: "ESTOQUE",
                    },
                  });
                }

                if (bookToProcess) {
                  batchProcessed.push(bookToProcess);
                }
              } catch (error) {
                console.error(`Erro ao processar livro ${book.codFle}:`, error);
                results.errors.push({
                  book: book.codFle,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Erro desconhecido",
                });
              }
            }

            return batchProcessed;
          },
          {
            timeout: 15000, // Aumentado para 15 segundos
            maxWait: 20000, // Tempo máximo de espera para começar a transação
          }
        );

        results.success.push(...batchResults);

        console.log(
          `Lote ${Math.floor(i / BATCH_SIZE) + 1} processado com sucesso: ${
            batchResults.length
          } livros`
        );
      } catch (error) {
        console.error(
          `Erro ao processar lote ${Math.floor(i / BATCH_SIZE) + 1}:`,
          error
        );
        results.errors.push(
          ...batch.map((book) => ({
            book: book.codFle,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          }))
        );

        // Aguarda um pouco mais se houver erro antes de tentar o próximo lote
        await delay(DELAY_BETWEEN_BATCHES * 2);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.success.length} livros processados com sucesso. ${results.errors.length} erros encontrados.`,
      results,
    });
  } catch (error) {
    console.error("Erro ao processar livros:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar livros",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
