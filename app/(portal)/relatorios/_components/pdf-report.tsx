//app/(portal)/relatorios/_components/pdf-report.tsx
"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/utils";

interface ReportData {
  codFle: string;
  title: string;
  totalQuantity: number;
  totalAmount: number;
  averagePrice: number;
}

interface PDFReportProps {
  data: ReportData[];
  totalVendas: number;
  totalQuantidade: number;
}

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
  titleCell: { width: "45%" },
  quantity: { width: "13%", textAlign: "right" },
  total: { width: "14%", textAlign: "right" },
  average: { width: "13%", textAlign: "right" },
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

// Componente do PDF
const PDFReport = ({ data, totalVendas, totalQuantidade }: PDFReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Livros Vendidos</Text>
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
          <Text>Total de Vendas:</Text>
          <Text>{formatPrice(totalVendas)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Quantidade Total:</Text>
          <Text>{totalQuantidade} livros</Text>
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
          <View style={[styles.tableCell, styles.quantity]}>
            <Text>Qtd.</Text>
          </View>
          <View style={[styles.tableCell, styles.total]}>
            <Text>Total</Text>
          </View>
          <View style={[styles.tableCell, styles.average]}>
            <Text>Média</Text>
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
            <View style={[styles.tableCell, styles.quantity]}>
              <Text>{book.totalQuantity}</Text>
            </View>
            <View style={[styles.tableCell, styles.total]}>
              <Text>{formatPrice(book.totalAmount)}</Text>
            </View>
            <View style={[styles.tableCell, styles.average]}>
              <Text>{formatPrice(book.averagePrice)}</Text>
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

// Componente do botão de download
export function PDFDownloadButton({
  data,
  totalVendas,
  totalQuantidade,
}: PDFReportProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split("T")[0];
      const blob = await pdf(
        <PDFReport
          data={data}
          totalVendas={totalVendas}
          totalQuantidade={totalQuantidade}
        />
      ).toBlob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-vendas-${currentDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={loading} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Gerando PDF..." : "Download PDF"}
    </Button>
  );
}
