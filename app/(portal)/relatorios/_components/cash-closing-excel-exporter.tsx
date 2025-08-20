// app/(portal)/relatorios/_components/cash-closing-excel-exporter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { formatPaymentMethod } from "@/lib/payment-utils";

interface Book {
  id: string;
  title: string;
  codFle: string;
}

interface Payment {
  id: string;
  method: string;
  amount: number;
  amountReceived?: number;
  change?: number;
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

interface PaymentSummary {
  method: string;
  total: number;
  count: number;
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

interface CashClosingExcelExporterProps {
  closing: CashClosingData;
}

export function CashClosingExcelExporter({
  closing,
}: CashClosingExcelExporterProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // Criar o workbook
      const workbook = XLSX.utils.book_new();

      // Dados do resumo geral
      const summaryData = [
        {
          Data: new Date(closing.date).toLocaleDateString(),
          "Valor Inicial": closing.initialAmount.toFixed(2),
          "Valor Final": closing.finalAmount.toFixed(2),
          "Total Vendas": closing.totalSales.toFixed(2),
          "Total Retiradas": closing.totalWithdrawals.toFixed(2),
          Diferença: (
            closing.finalAmount -
            closing.initialAmount -
            closing.totalSales +
            closing.totalWithdrawals
          ).toFixed(2),
        },
      ];

      // Criar planilha de resumo
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

      // Dados dos métodos de pagamento
      const paymentMethodsData = closing.paymentMethods.map((method) => ({
        Método: formatPaymentMethod(method.method),
        Quantidade: method.count,
        Total: method.total.toFixed(2),
      }));

      // Criar planilha de métodos de pagamento
      const paymentMethodsSheet = XLSX.utils.json_to_sheet(paymentMethodsData);
      XLSX.utils.book_append_sheet(
        workbook,
        paymentMethodsSheet,
        "Métodos de Pagamento"
      );

      // Dados das transações
      const transactionsData = closing.transactions.map((transaction) => ({
        Data: new Date(transaction.transactionDate).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo"
        }),
        Livro: transaction.book.title,
        "Código FLE": transaction.book.codFle,
        Quantidade: transaction.quantity,
        Valor: transaction.totalAmount.toFixed(2),
        Operador: transaction.operatorName,
        Tipo: transaction.type === "SALE" ? "Venda" : "Troca",
        "Método de Pagamento": transaction.payments
          .map((p) => formatPaymentMethod(p.method))
          .join(", "),
      }));

      // Ordenar transações por data (mais recentes primeiro)
      transactionsData.sort(
        (a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime()
      );

      // Criar planilha de transações
      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transações");

      // Dados das retiradas, se houver
      if (closing.withdrawals && closing.withdrawals.length > 0) {
        const withdrawalsData = closing.withdrawals.map((withdrawal) => ({
          Data: new Date(withdrawal.createdAt).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo"
          }),
          Motivo: withdrawal.reason,
          Valor: withdrawal.amount.toFixed(2),
          Operador: withdrawal.operatorName,
        }));

        // Ordenar retiradas por data (mais recentes primeiro)
        withdrawalsData.sort(
          (a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime()
        );

        // Criar planilha de retiradas
        const withdrawalsSheet = XLSX.utils.json_to_sheet(withdrawalsData);
        XLSX.utils.book_append_sheet(workbook, withdrawalsSheet, "Retiradas");
      }

      // Gerar o arquivo Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Converter o buffer para um Blob
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Criar uma URL para o Blob
      const url = window.URL.createObjectURL(blob);

      // Criar um link e simular o clique
      const link = document.createElement("a");
      link.href = url;
      link.download = `fechamento-${
        new Date(closing.date).toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar arquivo Excel:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      className="ml-2"
    >
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      {loading ? "Gerando Excel..." : "Download Excel"}
    </Button>
  );
}
