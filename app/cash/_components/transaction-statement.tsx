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
} from "@prisma/client";

interface StatementItem {
  id: string;
  date: Date;
  description: string;
  type: "SALE" | "WITHDRAWAL" | "EXCHANGE";
  amount: number;
}

interface TransactionStatementProps {
  register: CashRegister & {
    transactions: (Transaction & {
      book: Book;
    })[];
    withdrawals: CashWithdrawal[];
  };
}

export function TransactionStatement({ register }: TransactionStatementProps) {
  // Combina transações e retiradas em uma única lista
  const statementItems: StatementItem[] = [
    ...register.transactions.map((t) => ({
      id: t.id,
      date: t.createdAt,
      description: `Venda - ${t.book.title}`,
      type: t.type as "SALE" | "EXCHANGE",
      amount: Number(t.totalAmount),
    })),
    ...register.withdrawals.map((w) => ({
      id: w.id,
      date: w.createdAt,
      description: `Retirada - ${w.reason}`,
      type: "WITHDRAWAL" as const,
      amount: -Number(w.amount),
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
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statementItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{item.description}</TableCell>
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
