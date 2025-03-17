//app/(portal)/books/_components/upload-books.tsx
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

interface BookData {
  codFle: string;
  barCode?: string;
  quantity: number;
  coverPrice: number;
  price: number;
  title: string;
  publisher: string;
  distributor: string;
  subject: string;
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

export function UploadBooks() {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any[];

      // Remove a primeira linha (cabeçalhos)
      rows.shift();

      setProgress(30);

      // Mapear colunas do Excel para nosso formato
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const books: BookData[] = rows.map((row: any) => ({
        codFle: String(row[0] || "").trim(),
        barCode: String(row[1] || "").trim() || undefined,
        quantity: Number(row[2]) || 0,
        coverPrice: normalizePrice(row[3]),
        price: normalizePrice(row[3]),
        title: String(row[4] || "").trim(),
        publisher: String(row[5] || "").trim(),
        distributor: String(row[6] || "").trim(),
        subject: String(row[7] || "").trim(),
      }));

      setProgress(50);

      // Validar dados obrigatórios
      const invalidBooks = books.filter((book) => {
        return (
          !book.title ||
          !book.codFle ||
          book.quantity <= 0 ||
          book.coverPrice <= 0
        );
      });

      if (invalidBooks.length > 0) {
        throw new Error(
          `${invalidBooks.length} livros com dados inválidos. Verifique código FLE, título, quantidade e preço.`
        );
      }

      setProcessingStatus((prev) => ({
        ...prev,
        totalRows: books.length,
        totalBatches: Math.ceil(books.length / 25),
        batchSize: 25,
      }));

      // Enviar para API em lotes
      for (let i = 0; i < books.length; i += 25) {
        const batch = books.slice(i, i + 25);
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
          const response = await axios.post("/api/books/batch", {
            books: batch,
          });

          setProcessingStatus((prev) => ({
            ...prev,
            validRows: prev.validRows + response.data.results.success.length,
            processedRows: prev.processedRows + batch.length,
            batchProcessed: response.data.results.success.length,
            logs: [
              ...prev.logs,
              `Lote ${currentBatch} processado com sucesso: ${response.data.results.success.length} livros`,
            ],
          }));

          if (response.data.results.errors.length > 0) {
            setProcessingStatus((prev) => ({
              ...prev,
              invalidRows:
                prev.invalidRows + response.data.results.errors.length,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errors: [
                ...prev.errors,
                ...response.data.results.errors.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (e: any) => `Erro no livro ${e.book}: ${e.error}`
                ),
              ],
            }));
          }

          setProgress(50 + (currentBatch / Math.ceil(books.length / 25)) * 50);
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
          description: `${processingStatus.validRows} livros importados com sucesso.`,
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
        title: "Erro ao importar livros",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
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
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Importar Lista de Livros
        </Button>
        <input
          id="file-upload"
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
            <DialogTitle>Processando Lista de Livros</DialogTitle>
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
                  {processingStatus.batchSize} livros
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
                  {processingStatus.validRows} livros foram importados com
                  sucesso.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
