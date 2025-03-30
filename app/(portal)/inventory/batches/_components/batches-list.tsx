//app/(portal)/inventory/batches/_components/batches-list.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  Trash2,
  FileDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as XLSX from "xlsx";

interface Batch {
  name: string;
  bookCount: number;
  totalQuantity: number;
}

interface BatchDetails {
  batchName: string;
  summary: {
    totalBooks: number;
    totalQuantity: number;
    totalEntries: number;
    totalValue: number;
  };
  publishers: {
    name: string;
    totalBooks: number;
    totalQuantity: number;
    totalValue: number;
  }[];
}

export function BatchesList() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<BatchDetails | null>(null);
  const [selectedBatchForDelete, setSelectedBatchForDelete] = useState<
    string | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  // Buscar lotes
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/inventory/batches");
        setBatches(response.data);
      } catch (error) {
        console.error("Erro ao buscar lotes:", error);
        setError(
          "Não foi possível carregar os lotes. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Buscar detalhes de um lote específico
  const fetchBatchDetails = async (batchName: string) => {
    try {
      setSelectedBatch(null);
      const response = await axios.get(
        `/api/inventory/batch/${encodeURIComponent(batchName)}`
      );
      setSelectedBatch(response.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do lote:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do lote.",
        variant: "destructive",
      });
    }
  };

  // Excluir um lote
  const handleDeleteBatch = async () => {
    if (!selectedBatchForDelete) return;

    try {
      setDeleting(true);
      await axios.delete(
        `/api/inventory/batch/${encodeURIComponent(selectedBatchForDelete)}`
      );

      // Atualizar a lista de lotes
      setBatches((prev) =>
        prev.filter((batch) => batch.name !== selectedBatchForDelete)
      );

      toast({
        title: "Lote excluído",
        description: `O lote ${selectedBatchForDelete} foi excluído com sucesso.`,
      });

      setSelectedBatchForDelete(null);
    } catch (error) {
      console.error("Erro ao excluir lote:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível excluir o lote. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Exportar lote para Excel
  const handleExportBatch = async (batchName: string) => {
    try {
      setExporting(true);

      // Buscar livros do lote
      const response = await axios.get(
        `/api/inventory/books?batch=${encodeURIComponent(batchName)}`
      );
      const { books, summary } = response.data;

      // Formatar dados para Excel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const excelData = books.map((book: any) => ({
        "Código FLE": book.codFle,
        "Código de Barras": book.barCode || "",
        Título: book.title,
        Autor: book.author,
        Médium: book.medium,
        Editora: book.publisher,
        Distribuidor: book.distributor,
        Assunto: book.subject,
        Local: book.location,
        Quantidade: book.quantity,
        "Preço Feira": book.coverPrice,
        "Preço Capa": book.price,
        "Valor Total": book.coverPrice * book.quantity,
      }));

      // Criar workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventário");

      // Adicionar linha de resumo
      const summaryWorksheet = XLSX.utils.json_to_sheet([
        {
          Lote: batchName,
          "Total de Livros": summary.totalBooks,
          "Total de Unidades": summary.totalQuantity,
          "Valor Total": summary.totalValue,
        },
      ]);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Resumo");

      // Formatar data para nome do arquivo
      const date = new Date().toISOString().split("T")[0];
      const fileName = `inventario_${batchName.replace(
        /\s+/g,
        "_"
      )}_${date}.xlsx`;

      // Gerar arquivo
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Exportação concluída",
        description: `O arquivo ${fileName} foi gerado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar lote:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível exportar o lote. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium">Nenhum lote encontrado</h2>
        <p className="text-muted-foreground mb-6">
          Comece a registrar itens para criar um novo lote.
        </p>
        <Link href="/inventory">
          <Button>Criar Novo Lote</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <Card key={batch.name}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{batch.name}</CardTitle>
                <Badge variant="outline">{batch.bookCount} títulos</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm flex justify-between">
                  <span className="text-muted-foreground">
                    Quantidade total:
                  </span>
                  <span className="font-medium">
                    {batch.totalQuantity} unidades
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportBatch(batch.name)}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Exportar
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBatchForDelete(batch.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Dialog
                  onOpenChange={(open) => {
                    if (open) fetchBatchDetails(batch.name);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Detalhes do Lote: {batch.name}</DialogTitle>
                    </DialogHeader>

                    {selectedBatch ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Títulos</h3>
                            <p className="text-2xl font-bold">
                              {selectedBatch.summary.totalBooks}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Unidades</h3>
                            <p className="text-2xl font-bold">
                              {selectedBatch.summary.totalQuantity}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">
                              Entradas Registradas
                            </h3>
                            <p className="text-2xl font-bold">
                              {selectedBatch.summary.totalEntries}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Valor Total</h3>
                            <p className="text-2xl font-bold">
                              {formatPrice(selectedBatch.summary.totalValue)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Distribuição por Editora
                          </h3>
                          <div className="border rounded-md">
                            <div className="grid grid-cols-4 p-2 border-b bg-muted/50 text-sm font-medium">
                              <div>Editora</div>
                              <div className="text-right">Títulos</div>
                              <div className="text-right">Unidades</div>
                              <div className="text-right">Valor</div>
                            </div>
                            {selectedBatch.publishers.map((publisher) => (
                              <div
                                key={publisher.name}
                                className="grid grid-cols-4 p-2 border-b last:border-b-0 text-sm"
                              >
                                <div>{publisher.name}</div>
                                <div className="text-right">
                                  {publisher.totalBooks}
                                </div>
                                <div className="text-right">
                                  {publisher.totalQuantity}
                                </div>
                                <div className="text-right">
                                  {formatPrice(publisher.totalValue)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleExportBatch(batch.name)}
                            disabled={exporting}
                          >
                            {exporting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <FileDown className="h-4 w-4 mr-2" />
                            )}
                            Exportar Lote
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialog de confirmação para excluir lote */}
      <Dialog
        open={!!selectedBatchForDelete}
        onOpenChange={(open) => !open && setSelectedBatchForDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Lote</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o lote{" "}
              <strong>{selectedBatchForDelete}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedBatchForDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBatch}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
