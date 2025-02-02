"use client";

import { SerializedTransaction } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyQuantityData {
  date: string;
  quantity: number;
}

interface DailyQuantityChartProps {
  transactions: SerializedTransaction[];
}

export function DailyQuantityChart({ transactions }: DailyQuantityChartProps) {
  // Agrupa quantidades por dia
  const dailyData = transactions.reduce((acc: Record<string, number>, curr) => {
    // Converte a data UTC para local usando a data brasileira formatada
    const date = new Date(curr.transactionDate);
    const formattedDate = date.toLocaleDateString("pt-BR");

    acc[formattedDate] = (acc[formattedDate] || 0) + curr.quantity;
    return acc;
  }, {});

  // Formata dados para o gráfico
  const chartData: DailyQuantityData[] = Object.entries(dailyData)
    .map(([date, quantity]) => ({
      date,
      // Converte a data para objeto Date para ordenação
      rawDate: date.split("/").reverse().join("-"),
      quantity,
    }))
    .sort(
      (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
    )
    .map(({ date, quantity }) => ({ date, quantity }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value} un`}
          />
          <Tooltip
            formatter={(value: number) => [`${value} unidades`, "Quantidade"]}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="quantity"
            stroke="#2563eb"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
