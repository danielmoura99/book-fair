"use client";

import { SerializedTransaction } from "@/types";
import { Transaction, Book } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TransactionWithBook extends Transaction {
  book: Book;
}

interface BookSalesData {
  name: string;
  quantity: number;
}

interface TotalBookSalesChartProps {
  transactions: SerializedTransaction[];
}

export function TotalBookSalesChart({
  transactions,
}: TotalBookSalesChartProps) {
  // Agrupa todas as vendas por livro
  const bookSales = transactions.reduce(
    (acc: Record<string, BookSalesData>, curr) => {
      if (!acc[curr.book.title]) {
        acc[curr.book.title] = {
          name: curr.book.title,
          quantity: 0,
        };
      }
      acc[curr.book.title].quantity += curr.quantity;
      return acc;
    },
    {}
  );

  // Converte para array, ordena por quantidade e pega apenas TOP 10
  const chartData = Object.values(bookSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10); // TOP 10

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => `${value} un`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value} unidades`,
              "Total Vendido",
            ]}
            labelFormatter={(label) => `Livro: ${label}`}
          />
          <Bar
            dataKey="quantity"
            fill="#2563eb" // Azul mais vibrante
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
