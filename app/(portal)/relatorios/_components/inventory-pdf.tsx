// app/(portal)/relatorios/_components/inventory-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  summary: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  tableContainer: {
    width: "auto",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#bfbfbf",
    borderBottomWidth: 1,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 5,
    borderRightColor: "#bfbfbf",
    borderRightWidth: 1,
  },
  codFle: { width: "15%" },
  titleCell: { width: "40%" },
  publisher: { width: "15%" },
  distributor: { width: "15%" },
  quantity: { width: "7.5%", textAlign: "right" },
  sold: { width: "7.5%", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#666",
  },
});

interface InventoryBookData {
  codFle: string;
  title: string;
  publisher: string;
  distributor: string;
  quantity: number;
  quantitySold: number;
  lastSaleDate: string | null;
  isOutOfStock: boolean;
  soldOutDate: string | null;
}

interface InventoryPDFProps {
  data: InventoryBookData[];
  totalInventory: number;
  totalSold: number;
}

export const InventoryPDF = ({
  data,
  totalInventory,
  totalSold,
}: InventoryPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Livros em Estoque</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Total em Estoque:</Text>
          <Text>{totalInventory} livros</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Total Vendido:</Text>
          <Text>{totalSold} livros</Text>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.codFle]}>
            <Text>Código FLE</Text>
          </View>
          <View style={[styles.tableCell, styles.titleCell]}>
            <Text>Título</Text>
          </View>
          <View style={[styles.tableCell, styles.publisher]}>
            <Text>Editora</Text>
          </View>
          <View style={[styles.tableCell, styles.distributor]}>
            <Text>Distribuidor</Text>
          </View>
          <View style={[styles.tableCell, styles.quantity]}>
            <Text>Estoque</Text>
          </View>
          <View style={[styles.tableCell, styles.sold]}>
            <Text>Vendas</Text>
          </View>
        </View>

        {data.map((book) => (
          <View key={book.codFle} style={styles.tableRow}>
            <View style={[styles.tableCell, styles.codFle]}>
              <Text>{book.codFle}</Text>
            </View>
            <View style={[styles.tableCell, styles.titleCell]}>
              <Text>{book.title}</Text>
            </View>
            <View style={[styles.tableCell, styles.publisher]}>
              <Text>{book.publisher}</Text>
            </View>
            <View style={[styles.tableCell, styles.distributor]}>
              <Text>{book.distributor}</Text>
            </View>
            <View style={[styles.tableCell, styles.quantity]}>
              <Text>{book.quantity}</Text>
            </View>
            <View style={[styles.tableCell, styles.sold]}>
              <Text>{book.quantitySold}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>
          Book Fair Manager - Relatório gerado em{" "}
          {new Date().toLocaleString("pt-BR")}
        </Text>
      </View>
    </Page>
  </Document>
);
