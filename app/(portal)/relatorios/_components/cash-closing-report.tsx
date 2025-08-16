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
import { RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
  totalBooksSold: number; // ✅ NOVO CAMPO
  paymentMethods: PaymentSummary[];
  transactions: Transaction[];
  withdrawals?: Withdrawal[];
}

type PaymentSortField = 'method' | 'count' | 'total';
type PaymentSortDirection = 'asc' | 'desc';

export function CashClosingReport() {
  const queryClient = useQueryClient();
  const [paymentSortField, setPaymentSortField] = useState<PaymentSortField>('method');
  const [paymentSortDirection, setPaymentSortDirection] = useState<PaymentSortDirection>('asc');

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

  // Função de sorting para formas de pagamento
  const handlePaymentSort = (field: PaymentSortField) => {
    if (paymentSortField === field) {
      setPaymentSortDirection(paymentSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPaymentSortField(field);
      setPaymentSortDirection('asc');
    }
  };

  // Componente do cabeçalho ordenável para pagamentos
  const PaymentSortableHeader = ({ field, children }: { field: PaymentSortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handlePaymentSort(field)}
    >
      <div className="flex items-center justify-between">
        {children}
        <div className="ml-2">
          {paymentSortField === field && paymentSortDirection === 'asc' && <ChevronUp className="h-4 w-4" />}
          {paymentSortField === field && paymentSortDirection === 'desc' && <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
    </TableHead>
  );

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

          // Aplicar sorting aos métodos de pagamento
          const sortedPaymentMethods = [...closing.paymentMethods].sort((a, b) => {
            let aValue = a[paymentSortField];
            let bValue = b[paymentSortField];

            // Para strings, comparar ignorando case
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return paymentSortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return paymentSortDirection === 'asc' ? 1 : -1;
            return 0;
          });

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

                <div className="grid grid-cols-3 gap-4">
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
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Livros Vendidos
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      {closing.totalBooksSold} unidades
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
                        <PaymentSortableHeader field="method">Método</PaymentSortableHeader>
                        <PaymentSortableHeader field="count">
                          <div className="text-right">Quantidade</div>
                        </PaymentSortableHeader>
                        <PaymentSortableHeader field="total">
                          <div className="text-right">Total</div>
                        </PaymentSortableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPaymentMethods.map((method) => (
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
