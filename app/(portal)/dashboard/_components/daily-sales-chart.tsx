"use client";

import { Transaction } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoney } from "@/lib/utils";

interface DailySalesData {
  date: string;
  total: number;
}

interface DailySalesChartProps {
  transactions: Transaction[];
}

export function DailySalesChart({ transactions }: DailySalesChartProps) {
  // Agrupa transações por dia
  const dailyData = transactions.reduce((acc: Record<string, number>, curr) => {
    const date = new Date(curr.transactionDate).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + Number(curr.totalAmount);
    return acc;
  }, {});

  // Formata dados para o gráfico
  const chartData: DailySalesData[] = Object.entries(dailyData)
    .map(([date, total]) => ({
      date: new Date(date).toLocaleDateString("pt-BR"),
      total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatMoney(value)}
          />
          <Tooltip
            formatter={(value: number) => formatMoney(value)}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
