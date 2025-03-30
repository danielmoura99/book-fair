/* eslint-disable @typescript-eslint/no-explicit-any */
//app/api/inventory/batch/upload/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const BATCH_SIZE = 25; // Processamento em lotes menores
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo de delay entre lotes

// Função helper para aguardar um tempo
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Interface para a estrutura dos dados do Excel
interface InventoryBookRow {
  "Código FLE"?: string | number;
  Local?: string;
  quantidade?: number;
  " Preco Feira "?: string | number;
  "Preco capa"?: string | number;
  Título?: string;
  Autor?: string;
  Médium?: string;
  Editora?: string;
  Assunto?: string;
  [key: string]: any; // Para outras propriedades desconhecidas
}

// Função para normalizar os nomes das colunas
function normalizeColumns(row: InventoryBookRow) {
  const normalized: any = {};

  // Dicionário com várias possibilidades de nomes para cada campo
  const possibleNames: Record<string, string[]> = {
    codFle: ["Código FLE", "Cod FLE", "CodFLE", "Cod. FLE", "Codigo FLE"],
    barCode: [
      "Código de Barras",
      "Código Barras",
      "Cod Barras",
      "CodBarras",
      "EAN",
      "Barcode",
      "Bar Code",
    ],
    location: ["Local", "Localização", "Localizacao"],
    quantity: ["quantidade", "Quantidade", "Qtd", "Qtde"],
    coverPrice: [
      " Preco Feira ",
      "Preco Feira",
      "Preço Feira",
      "PrecoFeira",
      "Valor Feira",
    ],
    price: [
      "Preco capa",
      "Preço Capa",
      "Preço de Capa",
      "Valor de Capa",
      "Valor Capa",
    ],
    title: ["Título", "Titulo", "Nome", "Nome do Livro"],
    author: ["Autor", "Autoria"],
    medium: ["Médium", "Medium", "Médiun"],
    publisher: ["Editora", "Editor", "Publicadora"],
    distributor: ["Distribuidor", "Distribuidora", "Dist", "Fornecedor"],
    subject: ["Assunto", "Tema", "Categoria", "Tipo"],
  };

  // Para cada campo do nosso banco
  for (const [dbField, possibleColumnNames] of Object.entries(possibleNames)) {
    // Procurar por todas as possíveis variações do nome da coluna
    for (const columnName of possibleColumnNames) {
      if (columnName in row) {
        normalized[dbField] = row[columnName];
        break; // Para a busca ao encontrar a primeira correspondência
      }
    }
  }

  // Log para debug
  console.log("Colunas originais:", Object.keys(row));
  console.log("Colunas normalizadas:", Object.keys(normalized));

  return normalized;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const batchName = formData.get("batchName") as string;

    if (!file || !batchName) {
      return NextResponse.json(
        { error: "Arquivo e nome do lote são obrigatórios" },
        { status: 400 }
      );
    }

    // Ler o arquivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Converter para JSON
    const rows = XLSX.utils.sheet_to_json<InventoryBookRow>(worksheet);

    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    // Processar em lotes menores
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      try {
        // Aguardar antes de processar o próximo lote
        if (i > 0) {
          await delay(DELAY_BETWEEN_BATCHES);
        }

        console.log(
          `Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(
            rows.length / BATCH_SIZE
          )}`
        );

        // Processar cada lote em uma transação
        const batchResults = await prisma.$transaction(
          async (tx) => {
            const processedItems = [];

            for (const row of batch) {
              try {
                // Normalizar nomes de colunas
                const normalizedRow = normalizeColumns(row);

                // Converter valores para o formato correto e lidar com nulos e indefinidos
                const codFle = normalizedRow.codFle
                  ? String(normalizedRow.codFle).trim()
                  : "";

                if (!codFle) {
                  console.log("Linha sem código FLE:", row);
                  throw new Error("Código FLE é obrigatório");
                }

                // Verificar se já existe livro com este código FLE
                const existingBook = await tx.inventoryBook.findUnique({
                  where: { codFle },
                });

                if (existingBook) {
                  // Se já existir, apenas atualizar os dados
                  const updatedBook = await tx.inventoryBook.update({
                    where: { id: existingBook.id },
                    data: {
                      barCode: normalizedRow.barCode
                        ? String(normalizedRow.barCode).trim()
                        : existingBook.barCode,
                      location: normalizedRow.location
                        ? String(normalizedRow.location).trim()
                        : existingBook.location,
                      quantity:
                        normalizedRow.quantity !== undefined
                          ? normalizedRow.quantity
                          : existingBook.quantity,
                      coverPrice: String(
                        normalizedRow.coverPrice || existingBook.coverPrice
                      ),
                      price: String(
                        normalizedRow.price ||
                          normalizedRow.coverPrice ||
                          existingBook.price
                      ),
                      title: normalizedRow.title
                        ? String(normalizedRow.title).trim()
                        : existingBook.title,
                      author: normalizedRow.author
                        ? String(normalizedRow.author).trim()
                        : existingBook.author,
                      medium: normalizedRow.medium
                        ? String(normalizedRow.medium).trim()
                        : existingBook.medium,
                      publisher: normalizedRow.publisher
                        ? String(normalizedRow.publisher).trim()
                        : existingBook.publisher,
                      distributor: normalizedRow.distributor
                        ? String(normalizedRow.distributor).trim()
                        : existingBook.distributor || "NÃO INFORMADO",
                      subject: normalizedRow.subject
                        ? String(normalizedRow.subject).trim()
                        : existingBook.subject,
                      batchName: batchName,
                    },
                  });

                  processedItems.push({
                    ...updatedBook,
                    action: "updated",
                  });
                } else {
                  // Se não existir, criar novo registro
                  const newBook = await tx.inventoryBook.create({
                    data: {
                      codFle,
                      barCode: normalizedRow.barCode
                        ? String(normalizedRow.barCode).trim()
                        : null,
                      location: normalizedRow.location
                        ? String(normalizedRow.location).trim()
                        : "ESTOQUE",
                      quantity: normalizedRow.quantity || 0, // Usar a quantidade do Excel se disponível
                      coverPrice: String(normalizedRow.coverPrice || 0),
                      price: String(
                        normalizedRow.price || normalizedRow.coverPrice || 0
                      ),
                      title: normalizedRow.title
                        ? String(normalizedRow.title).trim()
                        : "",
                      author: normalizedRow.author
                        ? String(normalizedRow.author).trim()
                        : "",
                      medium: normalizedRow.medium
                        ? String(normalizedRow.medium).trim()
                        : "",
                      publisher: normalizedRow.publisher
                        ? String(normalizedRow.publisher).trim()
                        : "",
                      distributor: normalizedRow.distributor
                        ? String(normalizedRow.distributor).trim()
                        : "NÃO INFORMADO",
                      subject: normalizedRow.subject
                        ? String(normalizedRow.subject).trim()
                        : "",
                      batchName: batchName,
                    },
                  });

                  processedItems.push({
                    ...newBook,
                    action: "created",
                  });
                }
              } catch (error) {
                console.error(`Erro ao processar item:`, row);
                console.error(`Valores normalizados:`, normalizeColumns(row));
                console.error(`Erro:`, error);

                results.errors.push({
                  item: row,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Erro desconhecido",
                });
              }
            }

            return processedItems;
          },
          {
            timeout: 15000, // 15 segundos
            maxWait: 20000, // 20 segundos para iniciar a transação
          }
        );

        results.success.push(...batchResults);
      } catch (error) {
        console.error(
          `Erro ao processar lote ${Math.floor(i / BATCH_SIZE) + 1}:`,
          error
        );

        // Adicionar todos os itens do lote como erros
        results.errors.push(
          ...batch.map((item) => ({
            item,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          }))
        );

        // Aguardar mais tempo após um erro
        await delay(DELAY_BETWEEN_BATCHES * 2);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.success.length} livros processados com sucesso. ${results.errors.length} erros encontrados.`,
      results: {
        success: results.success.length,
        errors: results.errors.length,
        created: results.success.filter((item) => item.action === "created")
          .length,
        updated: results.success.filter((item) => item.action === "updated")
          .length,
        items: results.success.slice(0, 20), // Enviar apenas os primeiros 20 para não sobrecarregar a resposta
      },
    });
  } catch (error) {
    console.error("Erro ao processar arquivo Excel:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar arquivo Excel",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
