//app/(portal)/relatorios/_components/cash-closing-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatPrice } from "@/lib/utils";
import { formatPaymentMethod } from "@/lib/payment-utils";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
  },
  value: {
    width: "60%",
    textAlign: "right",
  },
  tableContainer: {
    width: "auto",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
  },
  method: { width: "40%" },
  count: { width: "20%", textAlign: "right" },
  amount: { width: "40%", textAlign: "right" },
  // Células do extrato detalhado
  dateTimeCell: { width: "20%" },
  bookCell: { width: "35%" },
  quantityCell: { width: "10%", textAlign: "right" },
  paymentCell: { width: "20%" },
  totalCell: { width: "15%", textAlign: "right" },
  reasonCell: { width: "45%" },
  operatorCell: { width: "20%" },
  amountCell: { width: "15%", textAlign: "right" },
});

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
  transactionDate: string;
  book: Book;
  quantity: number;
  totalAmount: number;
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
  withdrawals?: Withdrawal[];
}

interface CashClosingPDFProps {
  closing: CashClosingData;
  transactions: Transaction[];
}

export const CashClosingPDF = ({
  closing,
  transactions,
}: CashClosingPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Relatório de Fechamento de Caixa</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Data de Fechamento:</Text>
          <Text style={styles.value}>
            {new Date(closing.date).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Inicial:</Text>
          <Text style={styles.value}>{formatPrice(closing.initialAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Final:</Text>
          <Text style={styles.value}>{formatPrice(closing.finalAmount)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo por Forma de Pagamento</Text>
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.method]}>
              <Text>Método</Text>
            </View>
            <View style={[styles.tableCell, styles.count]}>
              <Text>Qtd.</Text>
            </View>
            <View style={[styles.tableCell, styles.amount]}>
              <Text>Total</Text>
            </View>
          </View>

          {closing.paymentMethods.map((method) => (
            <View key={method.method} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.method]}>
                <Text>{formatPaymentMethod(method.method)}</Text>
              </View>
              <View style={[styles.tableCell, styles.count]}>
                <Text>{method.count}</Text>
              </View>
              <View style={[styles.tableCell, styles.amount]}>
                <Text>{formatPrice(method.total)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {closing.withdrawals && closing.withdrawals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Retiradas de Caixa</Text>
          <View style={styles.tableContainer}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCell, styles.dateTimeCell]}>
                <Text>Data/Hora</Text>
              </View>
              <View style={[styles.tableCell, styles.reasonCell]}>
                <Text>Motivo</Text>
              </View>
              <View style={[styles.tableCell, styles.operatorCell]}>
                <Text>Operador</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>Valor</Text>
              </View>
            </View>

            {closing.withdrawals.map((withdrawal) => (
              <View key={withdrawal.id} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.dateTimeCell]}>
                  <Text>
                    {new Date(withdrawal.createdAt).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo"
                    })}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.reasonCell]}>
                  <Text>{withdrawal.reason}</Text>
                </View>
                <View style={[styles.tableCell, styles.operatorCell]}>
                  <Text>{withdrawal.operatorName}</Text>
                </View>
                <View style={[styles.tableCell, styles.amountCell]}>
                  <Text>{formatPrice(withdrawal.amount)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Totais</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Vendas:</Text>
          <Text style={styles.value}>{formatPrice(closing.totalSales)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Retiradas:</Text>
          <Text style={styles.value}>
            {formatPrice(closing.totalWithdrawals)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Extrato Detalhado</Text>
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.dateTimeCell]}>
              <Text>Data/Hora</Text>
            </View>
            <View style={[styles.tableCell, styles.bookCell]}>
              <Text>Livro</Text>
            </View>
            <View style={[styles.tableCell, styles.quantityCell]}>
              <Text>Qtd.</Text>
            </View>
            <View style={[styles.tableCell, styles.paymentCell]}>
              <Text>Pagamento</Text>
            </View>
            <View style={[styles.tableCell, styles.totalCell]}>
              <Text>Valor</Text>
            </View>
          </View>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.dateTimeCell]}>
                <Text>
                  {new Date(transaction.transactionDate).toLocaleString(
                    "pt-BR",
                    { timeZone: "America/Sao_Paulo" }
                  )}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.bookCell]}>
                <Text>{transaction.book.title}</Text>
              </View>
              <View style={[styles.tableCell, styles.quantityCell]}>
                <Text>{transaction.quantity}</Text>
              </View>
              <View style={[styles.tableCell, styles.paymentCell]}>
                <Text>
                  {transaction.payments
                    .map((p) => formatPaymentMethod(p.method))
                    .join(", ")}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.totalCell]}>
                <Text>{formatPrice(transaction.totalAmount)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
