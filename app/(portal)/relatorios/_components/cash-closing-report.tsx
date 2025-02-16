"use client";

import { useQuery } from "@tanstack/react-query";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CashClosingPDF } from "./cash-closing-pdf";
import { PDFDownloadButton } from "./pdf-download-button";
import { formatPaymentMethod } from "@/lib/payment-utils";

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

interface CashClosingData {
  id: string;
  date: string;
  initialAmount: number;
  finalAmount: number;
  totalSales: number;
  totalWithdrawals: number;
  paymentMethods: PaymentSummary[];
  transactions: Transaction[];
}

export function CashClosingReport() {
  const { data: closings, isLoading } = useQuery<CashClosingData[]>({
    queryKey: ["cash-closing-report"],
    queryFn: async () => {
      const response = await axios.get("/api/reports/cash-closing");
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Relatório de Fechamento de Caixa
      </h3>

      <ScrollArea className="h-[600px]">
        {closings?.map((closing) => (
          <Card key={closing.id} className="p-6 mb-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">
                  Fechamento - {formatDate(new Date(closing.date))}
                </h4>
                <PDFDownloadButton
                  document={
                    <CashClosingPDF
                      closing={closing}
                      transactions={closing.transactions.sort(
                        (a, b) =>
                          new Date(b.transactionDate).getTime() -
                          new Date(a.transactionDate).getTime()
                      )}
                    />
                  }
                  fileName={`fechamento-${
                    new Date(closing.date).toISOString().split("T")[0]
                  }.pdf`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Inicial</p>
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

              <div>
                <h5 className="font-semibold mb-2">Extrato Detalhado</h5>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Livro</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closing.transactions
                      .sort(
                        (a, b) =>
                          new Date(b.transactionDate).getTime() -
                          new Date(a.transactionDate).getTime()
                      )
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(
                              transaction.transactionDate
                            ).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell>{transaction.book.title}</TableCell>
                          <TableCell className="text-right">
                            {transaction.quantity}
                          </TableCell>
                          <TableCell>
                            {transaction.payments
                              .map((p) => formatPaymentMethod(p.method))
                              .join(", ")}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(transaction.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
