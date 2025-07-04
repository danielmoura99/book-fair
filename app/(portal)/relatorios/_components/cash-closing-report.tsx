//app/(portal)/relatorios/_components/cash-closing-report.tsx
"use client";

import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CashClosingPDF } from "./cash-closing-pdf";
import { PDFDownloadButton } from "./pdf-download-button";
import { formatPaymentMethod } from "@/lib/payment-utils";
import { CashClosingExcelExporter } from "./cash-closing-excel-exporter";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PaymentSummary {
  method: string;
  total: number;
  count: number;
}

interface Payment {
  id: string;
  method: string;
  amount: number;
  amountReceived?: number;
  change?: number;
}

interface Book {
  id: string;
  title: string;
  codFle: string;
}

interface Transaction {
  id: string;
  bookId: string;
  book: Book;
  quantity: number;
  totalAmount: number;
  transactionDate: string;
  type: "SALE" | "EXCHANGE";
  operatorName: string;
  payments: Payment[];
}

interface Withdrawal {
  id: string;
  amount: number;
  reason: string;
  operatorName: string;
  createdAt: string;
}

interface CashClosingData {
  id: string;
  date: string;
  initialAmount: number;
  finalAmount: number;
  totalSales: number;
  totalWithdrawals: number;
  paymentMethods: PaymentSummary[];
  transactions: Transaction[];
  withdrawals?: Withdrawal[];
}

export function CashClosingReport() {
  const queryClient = useQueryClient();

  const {
    data: closings,
    isLoading,
    refetch,
  } = useQuery<CashClosingData[]>({
    queryKey: ["cash-closing-report"],
    queryFn: async () => {
      const response = await axios.get("/api/reports/cash-closing");
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cash-closing-report"] });
    refetch();
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!closings || closings.length === 0) {
    return <div>Nenhum fechamento de caixa encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Relatório de Fechamento de Caixa
        </h3>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        {closings?.map((closing) => {
          const sortedTransactions = closing.transactions.sort(
            (a, b) =>
              new Date(b.transactionDate).getTime() -
              new Date(a.transactionDate).getTime()
          );

          return (
            <Card key={closing.id} className="p-6 mb-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">
                    Fechamento - {formatDate(new Date(closing.date))}
                  </h4>
                  <div className="flex">
                    <PDFDownloadButton
                      document={
                        <CashClosingPDF
                          closing={closing}
                          transactions={sortedTransactions}
                        />
                      }
                      fileName={`fechamento-${
                        new Date(closing.date).toISOString().split("T")[0]
                      }.pdf`}
                    />
                    <CashClosingExcelExporter closing={closing} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Valor Inicial
                    </p>
                    <p className="text-lg font-semibold">
                      {formatPrice(closing.initialAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Final</p>
                    <p className="text-lg font-semibold">
                      {formatPrice(closing.finalAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">
                    Resumo por Forma de Pagamento
                  </h5>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closing.paymentMethods.map((method) => (
                        <TableRow key={method.method}>
                          <TableCell>
                            {formatPaymentMethod(method.method)}
                          </TableCell>
                          <TableCell className="text-right">
                            {method.count}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(method.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Vendas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(closing.totalSales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Retiradas
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatPrice(closing.totalWithdrawals)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
