//app/api/inventory/batch/upload/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const BATCH_SIZE = 25; // Reduzido para 25 livros por vez
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo de delay entre lotes

// Função helper para aguardar um tempo
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface InventoryItem {
  codFle: string;
  barCode?: string;
  quantity: number;
  coverPrice: number;
  price: number;
  title: string;
  author: string;
  medium: string;
  publisher: string;
  distributor: string;
  subject: string;
  location: string;
}

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items: InventoryItem[] };
    const results = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success: [] as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors: [] as any[],
    };

    // Divide os itens em lotes menores
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      try {
        // Aguarda um pouco antes de processar o próximo lote
        if (i > 0) {
          await delay(DELAY_BETWEEN_BATCHES);
        }

        console.log(
          `Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(
            items.length / BATCH_SIZE
          )}`
        );

        // Processa cada lote em uma nova transação
        const batchResults = await prisma.$transaction(
          async (tx) => {
            const batchProcessed = [];

            for (const item of batch) {
              try {
                let inventoryItem = null;

                // Verifica se já existe um item com o mesmo codFle
                const existing = await tx.inventoryBook.findUnique({
                  where: { codFle: item.codFle },
                });

                if (existing) {
                  // Atualiza o item existente
                  inventoryItem = await tx.inventoryBook.update({
                    where: { id: existing.id },
                    data: {
                      quantity: {
                        increment: item.quantity, // Usa increment para evitar race conditions
                      },
                      coverPrice: item.coverPrice.toString(),
                      price: item.price.toString(),
                      title: item.title,
                      author: item.author || existing.author,
                      medium: item.medium || existing.medium,
                      publisher: item.publisher || existing.publisher,
                      distributor: item.distributor || existing.distributor,
                      subject: item.subject || existing.subject,
                      barCode: item.barCode || existing.barCode,
                      location: item.location || existing.location,
                    },
                  });
                } else {
                  // Cria um novo item no inventário
                  inventoryItem = await tx.inventoryBook.create({
                    data: {
                      codFle: item.codFle,
                      title: item.title,
                      quantity: item.quantity,
                      coverPrice: item.coverPrice.toString(),
                      price: item.price.toString(),
                      author: item.author || "",
                      medium: item.medium || "",
                      publisher: item.publisher || "",
                      distributor: item.distributor || "",
                      subject: item.subject || "",
                      barCode: item.barCode,
                      location: item.location || "ESTOQUE",
                    },
                  });
                }

                if (inventoryItem) {
                  batchProcessed.push(inventoryItem);
                }
              } catch (error) {
                console.error(`Erro ao processar item ${item.codFle}:`, error);
                results.errors.push({
                  item: item.codFle,
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
          } itens`
        );
      } catch (error) {
        console.error(
          `Erro ao processar lote ${Math.floor(i / BATCH_SIZE) + 1}:`,
          error
        );
        results.errors.push(
          ...batch.map((item) => ({
            item: item.codFle,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          }))
        );

        // Aguarda um pouco mais se houver erro antes de tentar o próximo lote
        await delay(DELAY_BETWEEN_BATCHES * 2);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.success.length} itens processados com sucesso. ${results.errors.length} erros encontrados.`,
      results,
    });
  } catch (error) {
    console.error("Erro ao processar itens de inventário:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar itens de inventário",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
