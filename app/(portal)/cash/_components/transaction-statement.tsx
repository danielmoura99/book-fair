/* eslint-disable @typescript-eslint/no-unused-vars */
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
  type: "SALE" | "WITHDRAWAL" | "EXCHANGE" | "PAYMENT" | "RETURN";
  amount: number;
  paymentMethod?: string;
  operatorName?: string;
  saleGroupId?: string | null;
}

// ✅ NOVO: Interface estendida para incluir livro devolvido
interface TransactionWithDetails extends Transaction {
  book: Book;
  payments?: Payment[];
  sequentialId: number;
  saleGroupId: string | null;
  returnedBook?: {
    id: string;
    title: string;
    codFle: string;
  } | null;
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
  // Agrupar por saleGroupId se existir, senão por sequentialId
  const transactionGroups = register.transactions.reduce((acc, transaction) => {
    const key = transaction.saleGroupId || transaction.sequentialId.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(transaction);
    return acc;
  }, {} as Record<string, TransactionWithDetails[]>);

  // Processar grupos de transações
  const statementItems: StatementItem[] = [];

  // Para cada grupo de transação
  Object.entries(transactionGroups).forEach(([groupKey, transactions]) => {
    if (transactions.length === 0) return;

    // Pegar a primeira transação como referência
    const firstTransaction = transactions[0];
    const isSaleGroup = !!firstTransaction.saleGroupId;

    // ✅ NOVO: Identificar tipos específicos
    const isReturn =
      Number(firstTransaction.totalAmount) < 0 &&
      firstTransaction.type === "EXCHANGE" &&
      !firstTransaction.returnedBookId; // Devolução não tem livro novo

    const isExchange =
      firstTransaction.type === "EXCHANGE" &&
      firstTransaction.returnedBookId && // Tem livro devolvido
      transactions.length === 1; // Troca é sempre transação única

    // Calcular total da compra
    const totalAmount = transactions.reduce(
      (sum, t) => sum + Number(t.totalAmount),
      0
    );

    // Pegar todos os pagamentos únicos do grupo
    const allPayments = transactions
      .flatMap((t) => t.payments || [])
      .filter(
        (payment, index, self) =>
          self.findIndex((p) => p.id === payment.id) === index
      );

    // Se não há pagamentos, criar entrada única
    if (!allPayments || allPayments.length === 0) {
      const bookNames = transactions.map((t) => t.book.title).join(", ");

      // ✅ NOVO: Descrição específica para cada tipo
      let displayId: string;
      let transactionType: StatementItem["type"];
      let description: string;

      if (isReturn) {
        displayId = `Devolução`;
        transactionType = "RETURN";
        description = `${displayId} - ${bookNames}`;
      } else if (isExchange) {
        // ✅ NOVO: Descrição completa para troca
        displayId = `Troca`;
        transactionType = "EXCHANGE";
        const returnedBookName =
          firstTransaction.returnedBook?.title || "Livro Antigo";
        description = `${displayId} - ${returnedBookName} por ${firstTransaction.book.title}`;
      } else if (isSaleGroup) {
        displayId = `Venda #${firstTransaction.sequentialId}`;
        transactionType = "SALE";
        description = `${displayId} - ${bookNames}`;
      } else {
        displayId = `Venda #${firstTransaction.sequentialId}`;
        transactionType = "SALE";
        description = `${displayId} - ${bookNames}`;
      }

      statementItems.push({
        id: `${firstTransaction.id}-legacy`,
        date: firstTransaction.createdAt,
        description: description,
        type: transactionType,
        amount: totalAmount,
        operatorName: firstTransaction.operatorName,
        saleGroupId: firstTransaction.saleGroupId,
      });
    } else {
      // Criar uma entrada para cada método de pagamento ÚNICO
      allPayments.forEach((payment, index) => {
        const bookCount = transactions.length;

        // ✅ NOVO: Descrição específica para cada tipo
        let displayId: string;
        let description: string;
        let transactionType: StatementItem["type"] = "PAYMENT";

        if (isReturn) {
          displayId = `Devolução`;
          description = `${displayId} - ${firstTransaction.book.title}`;
          transactionType = "RETURN";
        } else if (isExchange) {
          // ✅ NOVO: Descrição completa para troca
          displayId = `Troca`;
          const returnedBookName =
            firstTransaction.returnedBook?.title || "Livro Antigo";
          description = `${displayId} - ${returnedBookName} por ${firstTransaction.book.title}`;
          transactionType = "EXCHANGE";
        } else if (isSaleGroup) {
          displayId = `Venda #${firstTransaction.sequentialId}`;
          description =
            bookCount > 1
              ? `${displayId} - ${bookCount} livros (${
                  PAYMENT_METHOD_LABELS[payment.method]
                })`
              : `${displayId} - ${firstTransaction.book.title} (${
                  PAYMENT_METHOD_LABELS[payment.method]
                })`;
        } else {
          displayId = `Venda #${firstTransaction.sequentialId}`;
          description = `${displayId} - ${firstTransaction.book.title} (${
            PAYMENT_METHOD_LABELS[payment.method]
          })`;
        }

        // ✅ CORRIGIDO: Valor correto baseado no tipo
        let paymentAmount: number;

        if (isReturn) {
          paymentAmount = -Number(payment.amount); // Devolução = valor negativo
        } else if (isExchange) {
          // ✅ NOVO: Para troca, usar o totalAmount da transação (diferença)
          paymentAmount = Number(firstTransaction.totalAmount);
        } else {
          // Vendas normais
          paymentAmount =
            payment.method === "CASH" && payment.amountReceived
              ? Number(payment.amountReceived)
              : Number(payment.amount);
        }

        statementItems.push({
          id: `${firstTransaction.id}-${payment.id}`,
          date: firstTransaction.createdAt,
          description: description,
          type: transactionType,
          amount: paymentAmount,
          paymentMethod: payment.method,
          operatorName: firstTransaction.operatorName,
          saleGroupId: firstTransaction.saleGroupId,
        });

        // Se houver troco (não aplicável em devoluções e trocas)
        if (
          !isReturn &&
          !isExchange &&
          payment.change &&
          Number(payment.change) > 0
        ) {
          statementItems.push({
            id: `${firstTransaction.id}-${payment.id}-change`,
            date: firstTransaction.createdAt,
            description: `Troco - ${displayId}`,
            type: "WITHDRAWAL",
            amount: -Number(payment.change),
            paymentMethod: "CASH",
            operatorName: firstTransaction.operatorName,
            saleGroupId: firstTransaction.saleGroupId,
          });
        }
      });
    }
  });

  // Adicionar outras retiradas
  const withdrawalItems: StatementItem[] = register.withdrawals.map((w) => ({
    id: w.id,
    date: w.createdAt,
    description: `Retirada - ${w.reason}`,
    type: "WITHDRAWAL" as const,
    amount: -Number(w.amount),
    paymentMethod: "WITHDRAWAL",
    operatorName: w.operatorName,
  }));

  // Combinar e ordenar todos os itens
  const allItems = [...statementItems, ...withdrawalItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

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
            {allItems.map((item) => (
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
