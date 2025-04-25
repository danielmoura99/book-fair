/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/inventory/logs/_components/inventory-logs-table.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText, PlusCircle, Pencil, Trash } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 20;

interface InventoryLog {
  id: string;
  type: string;
  bookId: string;
  bookCodFle: string;
  bookTitle: string;
  operatorName: string | null;
  previousData: any | null;
  newData: any;
  timestamp: Date;
  notes: string | null;
}

interface InventoryLogsTableProps {
  logs: InventoryLog[];
}

export function InventoryLogsTable({ logs }: InventoryLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<InventoryLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filtrar logs com base no termo de busca
  const filteredLogs = logs.filter(
    (log) =>
      log.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.bookCodFle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.operatorName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleViewDetails = (log: InventoryLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  // Função para renderizar a badge do tipo de log
  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case "CREATE":
        return (
          <Badge variant="default" className="bg-green-500">
            <PlusCircle className="h-3 w-3 mr-1" />
            Criação
          </Badge>
        );
      case "UPDATE":
        return (
          <Badge variant="default" className="bg-blue-500">
            <Pencil className="h-3 w-3 mr-1" />
            Edição
          </Badge>
        );
      case "DELETE":
        return (
          <Badge variant="destructive">
            <Trash className="h-3 w-3 mr-1" />
            Exclusão
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Função para formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, código FLE ou operador..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Resetar página ao buscar
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <ScrollArea className="h-[600px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Data/Hora</TableHead>
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="w-[100px]">Código FLE</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead className="text-right w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm
                      ? "Nenhum registro encontrado para esta busca"
                      : "Nenhum registro de atividade encontrado"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{getLogTypeBadge(log.type)}</TableCell>
                    <TableCell>{log.bookCodFle}</TableCell>
                    <TableCell className="font-medium">
                      {log.bookTitle}
                    </TableCell>
                    <TableCell>{log.operatorName || "Sistema"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(log)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      <div className="text-sm text-muted-foreground">
        Total: {filteredLogs.length} registros encontrados
      </div>

      {/* Modal de detalhes do log */}
      {selectedLog && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Detalhes da Atividade</DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Data/Hora
                    </h3>
                    <p>{formatDate(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Tipo
                    </h3>
                    <p>{getLogTypeBadge(selectedLog.type)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Código FLE
                    </h3>
                    <p>{selectedLog.bookCodFle}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Título
                    </h3>
                    <p>{selectedLog.bookTitle}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Operador
                    </h3>
                    <p>{selectedLog.operatorName || "Sistema"}</p>
                  </div>
                  {selectedLog.notes && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Observações
                      </h3>
                      <p>{selectedLog.notes}</p>
                    </div>
                  )}
                </div>

                {selectedLog.type === "UPDATE" && selectedLog.previousData && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Alterações</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Dados Anteriores
                        </h4>
                        <pre className="text-xs overflow-auto p-2 bg-muted rounded-md max-h-60">
                          {JSON.stringify(selectedLog.previousData, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Novos Dados
                        </h4>
                        <pre className="text-xs overflow-auto p-2 bg-muted rounded-md max-h-60">
                          {JSON.stringify(selectedLog.newData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {(selectedLog.type === "CREATE" ||
                  selectedLog.type === "DELETE") && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Dados do Livro</h3>
                    <pre className="text-xs overflow-auto p-2 bg-muted rounded-md max-h-60">
                      {JSON.stringify(selectedLog.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 pt-2">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Fechar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Criar um arquivo JSON para download
                  const dataStr = JSON.stringify(selectedLog, null, 2);
                  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
                    dataStr
                  )}`;
                  const exportFileDefaultName = `log-${selectedLog.id}.json`;

                  const linkElement = document.createElement("a");
                  linkElement.setAttribute("href", dataUri);
                  linkElement.setAttribute("download", exportFileDefaultName);
                  linkElement.click();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
