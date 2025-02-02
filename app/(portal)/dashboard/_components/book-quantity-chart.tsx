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

interface TransactionWithBook extends Transaction {
  book: Book;
}

interface BookQuantityData {
  name: string;
  quantity: number;
}

interface BookQuantityChartProps {
  transactions: TransactionWithBook[];
}

export function BookQuantityChart({ transactions }: BookQuantityChartProps) {
  // Agrupa quantidades por livro
  const bookData = transactions.reduce(
    (acc: Record<string, BookQuantityData>, curr) => {
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

  // Converte para array e ordena por quantidade
  const chartData = Object.values(bookData)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // Pega apenas os 5 mais vendidos

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => `${value} un`} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} unidades`, "Quantidade"]}
            labelFormatter={(label) => `Livro: ${label}`}
          />
          <Bar dataKey="quantity" fill="#8884d8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
