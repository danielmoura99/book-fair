//app/(portal)/cash/_components/transaction-statement.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  CashRegister,
  Transaction,
  CashWithdrawal,
  Book,
  Payment,
} from "@prisma/client";

interface StatementItem {
  id: string;
  date: Date;
  description: string;
  type: "SALE" | "WITHDRAWAL" | "EXCHANGE" | "PAYMENT";
  amount: number;
  paymentMethod?: string;
  operatorName?: string;
}

interface TransactionWithDetails extends Transaction {
  book: Book;
  payments?: Payment[];
}

interface TransactionStatementProps {
  register: CashRegister & {
    transactions: TransactionWithDetails[];
    withdrawals: CashWithdrawal[];
  };
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  PIX: "PIX",
  EXCHANGE: "Troca ou Devolução",
  WITHDRAWAL: "Dinheiro/Troco",
};

export function TransactionStatement({ register }: TransactionStatementProps) {
  // Combina transações, pagamentos e retiradas em uma única lista
  const statementItems: StatementItem[] = [
    // Mapeia cada transação e seus pagamentos
    ...register.transactions.flatMap((t) => {
      const items: StatementItem[] = [];

      // Se não houver payments definido ou se for um array vazio,
      // trata como uma única transação (para compatibilidade com registros antigos)
      if (!t.payments || t.payments.length === 0) {
        items.push({
          id: t.id,
          date: t.createdAt,
          description: `${t.type === "EXCHANGE" ? "Troca" : "Venda"} - ${
            t.book.title
          }`,
          type: t.type === "EXCHANGE" ? "EXCHANGE" : "SALE",
          amount: Number(t.totalAmount),
          operatorName: t.operatorName,
        });
      } else {
        // Processa os pagamentos normalmente
        t.payments.forEach((payment) => {
          items.push({
            id: `${t.id}-${payment.id}`,
            date: t.createdAt,
            description: `Venda - ${t.book.title} (${
              PAYMENT_METHOD_LABELS[payment.method]
            })`,
            type: "PAYMENT",
            amount:
              payment.method === "CASH" && payment.amountReceived
                ? Number(payment.amountReceived) // Para dinheiro, mostra o valor recebido
                : Number(payment.amount), // Para outros métodos, mostra o valor normal
            paymentMethod: payment.method,
            operatorName: t.operatorName,
          });

          // Se houver troco, registra como valor negativo
          if (payment.change && Number(payment.change) > 0) {
            items.push({
              id: `${t.id}-${payment.id}-change`,
              date: t.createdAt,
              description: `Troco - ${t.book.title}`,
              type: "WITHDRAWAL",
              amount: -Number(payment.change), // Valor negativo para o troco
              paymentMethod: "CASH",
              operatorName: t.operatorName,
            });
          }
        });
      }

      return items;
    }),
    // Adiciona outras retiradas
    ...register.withdrawals.map((w) => ({
      id: w.id,
      date: w.createdAt,
      description: `Retirada - ${w.reason}`,
      type: "WITHDRAWAL" as const,
      amount: -Number(w.amount),
      paymentMethod: "WITHDRAWAL",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Extrato de Movimentações</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Forma Pagto</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statementItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.operatorName || "-"}</TableCell>
                <TableCell>
                  {item.paymentMethod
                    ? PAYMENT_METHOD_LABELS[item.paymentMethod] ||
                      item.paymentMethod
                    : "-"}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    item.amount < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatPrice(Math.abs(item.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
