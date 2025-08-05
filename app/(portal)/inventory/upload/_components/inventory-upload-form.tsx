/* eslint-disable @typescript-eslint/no-explicit-any */
//app/(portal)/inventory/upload/_components/inventory-upload-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";

import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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

interface ProcessingStatus {
  totalRows: number;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  totalBatches: number;
  currentBatch: number;
  batchSize: number;
  batchProcessed: number;
  errors: string[];
  logs: string[];
}

export function InventoryUploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    totalRows: 0,
    processedRows: 0,
    validRows: 0,
    invalidRows: 0,
    totalBatches: 0,
    currentBatch: 0,
    batchSize: 25,
    batchProcessed: 0,
    errors: [],
    logs: [],
  });

  const { toast } = useToast();

  const resetStatus = () => {
    setProcessingStatus({
      totalRows: 0,
      processedRows: 0,
      validRows: 0,
      invalidRows: 0,
      totalBatches: 0,
      currentBatch: 0,
      batchSize: 25,
      batchProcessed: 0,
      errors: [],
      logs: [],
    });
    setProgress(0);
  };

  const normalizePrice = (price: string | number): number => {
    if (!price) return 0;

    let priceStr = String(price);

    // Remove R$, espaços e converte vírgula para ponto
    priceStr = priceStr.replace(/[R$\s]/g, "").replace(",", ".");

    // Remove qualquer caractere que não seja número ou ponto
    priceStr = priceStr.replace(/[^\d.]/g, "");

    const value = Number(priceStr);
    return isNaN(value) ? 0 : value;
  };

  const normalizeQuantity = (quantity: string | number): number => {
    if (!quantity && quantity !== 0) return 0;
    
    const str = String(quantity).trim().toUpperCase();
    
    // Tratamento de casos especiais comuns em planilhas
    switch (str) {
      case 'E':
      case 'ESGOTADO':
        return 0;
      case 'N':
      case 'NÃO':
      case 'N/A':
      case 'NA':
        return 0;
      case '':
      case '-':
        return 0;
      default:
        const num = Number(str);
        return isNaN(num) ? 0 : Math.max(0, Math.floor(num)); // Apenas inteiros positivos
    }
  };

  const processExcelFile = async (file: File) => {
    try {
      setIsUploading(true);
      setShowDialog(true);
      resetStatus();
      setProgress(10);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
        header: 1,
      }) as any[];

      // Remove a primeira linha (cabeçalhos)
      rows.shift();

      setProgress(30);

      // Log das primeiras linhas para debug
      console.log("Primeiras 3 linhas do Excel:", rows.slice(0, 3));
      
      // Mapear colunas do Excel para nosso formato conforme a estrutura real do arquivo
      let inventoryItems: InventoryItem[] = rows.map((row: any, index: number) => {
        const rawQuantity = row[3];
        const normalizedQuantity = normalizeQuantity(rawQuantity);
        
        const item = {
          codFle: String(row[0] || "").trim(), // Código FLE
          barCode: String(row[1] || "").trim() || undefined, // cod barras
          location: String(row[2] || "").trim() || "ESTOQUE", // Local
          quantity: normalizedQuantity, // quantidade normalizada
          coverPrice: normalizePrice(row[5]), // Preco Feira
          price: normalizePrice(row[4]), // Preco capa
          title: String(row[6] || "").trim(), // Título
          author: String(row[7] || "").trim(), // Autor
          medium: String(row[8] || "").trim(), // Médium
          publisher: String(row[9] || "").trim(), // Editora 2024
          distributor: String(row[11] || "").trim(), // Distribuidor
          subject: String(row[10] || "").trim(), // Assunto
        };
        
        // Log dos primeiros itens para debug, incluindo quantidade original
        if (index < 3) {
          console.log(`Item ${index + 1}:`, {
            ...item,
            quantidadeOriginal: rawQuantity,
            quantidadeNormalizada: normalizedQuantity
          });
        }
        
        return item;
      });

      setProgress(50);

      // Validar dados obrigatórios com melhor feedback
      const invalidItems: {
        rowNumber: number; // +2 porque removemos a linha de cabeçalho e os índices começam em 0
        issues: string;
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
      }[] = [];
      const validItems = [];

      // Verificar item por item e registrar problemas específicos
      for (let i = 0; i < inventoryItems.length; i++) {
        const item = inventoryItems[i];
        const issues = [];

        if (!item.codFle) issues.push("código FLE ausente");
        if (!item.title) issues.push("título ausente");
        if (item.coverPrice <= 0) issues.push("preço de feira inválido");
        if (item.price <= 0) issues.push("preço de capa inválido");

        if (issues.length > 0) {
          invalidItems.push({
            ...item,
            rowNumber: i + 2, // +2 porque removemos a linha de cabeçalho e os índices começam em 0
            issues: issues.join(", "),
          });
        } else {
          validItems.push(item);
        }
      }

      // Analisar e mostrar os primeiros 5 itens inválidos para diagnóstico
      if (invalidItems.length > 0) {
        console.log("Exemplos de itens inválidos:", invalidItems.slice(0, 5));

        if (validItems.length === 0) {
          throw new Error(
            `Todos os ${invalidItems.length} itens possuem dados inválidos. Verifique se o formato do arquivo está correto e se as colunas estão na ordem esperada.`
          );
        }

        // Continuar com os itens válidos, mas registrar os inválidos
        setProcessingStatus((prev) => ({
          ...prev,
          logs: [
            ...prev.logs,
            `Atenção: ${invalidItems.length} itens com dados inválidos foram ignorados.`,
            `Continuando com ${validItems.length} itens válidos.`,
            `Exemplos de problemas: ${invalidItems
              .slice(0, 3)
              .map(
                (item) =>
                  `Linha ${item.rowNumber}: ${item.codFle || "sem código"} - ${
                    item.issues
                  }`
              )
              .join("; ")}`,
          ],
          invalidRows: invalidItems.length,
        }));

        // Substituir os itens do inventário pelos válidos para continuar o processamento
        inventoryItems = validItems;
      }

      setProcessingStatus((prev) => ({
        ...prev,
        totalRows: inventoryItems.length,
        totalBatches: Math.ceil(inventoryItems.length / 25),
        batchSize: 25,
      }));

      // Enviar para API em lotes
      for (let i = 0; i < inventoryItems.length; i += 25) {
        const batch = inventoryItems.slice(i, i + 25);
        const currentBatch = Math.floor(i / 25) + 1;

        setProcessingStatus((prev) => ({
          ...prev,
          currentBatch,
          logs: [
            ...prev.logs,
            `Processando lote ${currentBatch} de ${prev.totalBatches}...`,
          ],
        }));

        try {
          const response = await axios.post("/api/import", {
            books: batch,
          });

          // Log da resposta completa para debug
          console.log("Resposta da API:", response.data);

          // Verificar se a estrutura da resposta está correta
          if (!response.data || !response.data.results) {
            throw new Error("Resposta da API inválida - estrutura 'results' não encontrada");
          }

          const results = response.data.results;
          const createdCount = results.created?.length || 0;
          const updatedCount = results.updated?.length || 0;
          const successCount = createdCount + updatedCount;
          const errorsCount = results.errors?.length || 0;

          console.log(`Lote ${currentBatch}: ${createdCount} criados, ${updatedCount} atualizados, ${errorsCount} erros`);

          setProcessingStatus((prev) => ({
            ...prev,
            validRows: prev.validRows + successCount,
            processedRows: prev.processedRows + batch.length,
            batchProcessed: successCount,
            logs: [
              ...prev.logs,
              `Lote ${currentBatch} processado: ${createdCount} criados, ${updatedCount} atualizados`,
              ...(errorsCount > 0 ? [`${errorsCount} itens com erro no lote ${currentBatch}`] : [])
            ],
          }));

          if (results.errors && results.errors.length > 0) {
            setProcessingStatus((prev) => ({
              ...prev,
              invalidRows: prev.invalidRows + results.errors.length,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errors: [
                ...prev.errors,
                ...results.errors.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (e: any) => `Erro no item ${e.codFle || e.item || 'desconhecido'}: ${e.error}`
                ),
              ],
            }));
          }

          setProgress(
            50 + (currentBatch / Math.ceil(inventoryItems.length / 25)) * 50
          );
        } catch (error) {
          console.error("Erro ao processar lote:", error);
          setProcessingStatus((prev) => ({
            ...prev,
            invalidRows: prev.invalidRows + batch.length,
            errors: [
              ...prev.errors,
              `Erro ao processar lote ${currentBatch}: ${
                error instanceof Error ? error.message : "Erro desconhecido"
              }`,
            ],
            logs: [...prev.logs, `Erro ao processar lote ${currentBatch}`],
          }));
        }
      }

      if (processingStatus.validRows > 0) {
        toast({
          title: "Sucesso!",
          description: `${processingStatus.validRows} itens de inventário importados com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setProcessingStatus((prev) => ({
        ...prev,
        errors: [
          ...prev.errors,
          error instanceof Error ? error.message : "Erro desconhecido",
        ],
      }));
      toast({
        variant: "destructive",
        title: "Erro ao importar inventário",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setProgress(100);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx)",
      });
      return;
    }

    processExcelFile(file);
  };

  const handleClose = () => {
    setShowDialog(false);
    setIsUploading(false);
    resetStatus();
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => document.getElementById("inventory-upload")?.click()}
          disabled={isUploading}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Importar
        </Button>
        <input
          id="inventory-upload"
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Processando Inventário</DialogTitle>
            <DialogDescription>
              Aguarde enquanto processamos seu arquivo...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Progress value={progress} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Total de linhas: {processingStatus.totalRows}</div>
              <div>Processadas: {processingStatus.processedRows}</div>
              <div className="text-green-600">
                Válidas: {processingStatus.validRows}
              </div>
              <div className="text-red-600">
                Inválidas: {processingStatus.invalidRows}
              </div>
            </div>

            {processingStatus.totalBatches > 0 && (
              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 text-sm font-medium">
                  Dividido em {processingStatus.totalBatches} lotes de{" "}
                  {processingStatus.batchSize} itens
                </h4>
                <div className="max-h-32 space-y-1 overflow-auto text-sm text-muted-foreground">
                  {processingStatus.logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {processingStatus.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Erros encontrados</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 max-h-40 overflow-auto text-sm">
                    {processingStatus.errors.map((error, index) => (
                      <div key={index} className="mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {processingStatus.validRows > 0 && progress === 100 && (
              <Alert>
                <AlertTitle>Processamento concluído</AlertTitle>
                <AlertDescription>
                  {processingStatus.validRows} itens de inventário foram
                  importados com sucesso.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
