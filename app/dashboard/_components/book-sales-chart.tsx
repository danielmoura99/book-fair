"use client";

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
import { formatMoney } from "@/lib/utils";
import { SerializedTransaction } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TransactionWithBook extends Transaction {
  book: Book;
}

interface BookSalesData {
  name: string;
  total: number;
  quantity: number;
}

interface BookSalesChartProps {
  transactions: SerializedTransaction[];
}

export function BookSalesChart({ transactions }: BookSalesChartProps) {
  // Agrupa vendas por livro
  const bookData = transactions.reduce(
    (acc: Record<string, BookSalesData>, curr) => {
      if (!acc[curr.book.title]) {
        acc[curr.book.title] = {
          name: curr.book.title,
          total: 0,
          quantity: 0,
        };
      }
      acc[curr.book.title].total += Number(curr.totalAmount);
      acc[curr.book.title].quantity += curr.quantity;
      return acc;
    },
    {}
  );

  // Converte para array e ordena por total
  const chartData = Object.values(bookData)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Pega apenas os 5 mais vendidos

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => formatMoney(value)} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatMoney(value)}
            labelFormatter={(label) => `Livro: ${label}`}
          />
          <Bar dataKey="total" fill="#8884d8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
