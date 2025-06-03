"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

//import { EditTransactionButton } from "./edit-transaction-button";
//import { DeleteTransactionButton } from "./delete-transaction-button";
import { SerializedTransaction } from "@/types";

interface TransactionDataTableProps {
  data: SerializedTransaction[];
}

export function TransactionDataTable({ data }: TransactionDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead> {/* NOVA COLUNA */}
            <TableHead>Data</TableHead>
            <TableHead>Código FLE</TableHead>
            <TableHead>Livro</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Operador</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead>Forma de Pagamento</TableHead>
            {/*<TableHead className="text-right">Ações</TableHead>*/}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono text-sm">
                {transaction.sequentialId} {/* NOVO CAMPO */}
              </TableCell>
              <TableCell>
                {new Date(transaction.transactionDate).toLocaleDateString(
                  "pt-BR"
                )}
              </TableCell>
              <TableCell>{transaction.book.codFle}</TableCell>
              <TableCell>{transaction.book.title}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{transaction.operatorName}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(transaction.totalAmount)}
              </TableCell>
              <TableCell>
                {PAYMENT_METHOD_LABELS[transaction.paymentMethod] ||
                  transaction.paymentMethod}
              </TableCell>
              {/* <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditTransactionButton transaction={transaction} />
                  <DeleteTransactionButton id={transaction.id} />
                </div>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Objeto para mapear os métodos de pagamento para labels em português
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  PIX: "PIX",
  EXCHANGE: "Troca ou Devolução",
};
