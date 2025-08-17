/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SerializedTransaction } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface DailySalesData {
  date: string;
  total: number;
}

interface DailySalesChartProps {
  transactions: SerializedTransaction[];
}

export function DailySalesChart({ transactions }: DailySalesChartProps) {
  // Agrupa valores por dia
  const dailyData = transactions.reduce((acc: Record<string, number>, curr) => {
    // Converte a data UTC para local usando a data brasileira formatada
    const date = new Date(curr.transactionDate);
    const formattedDate = date.toLocaleDateString("pt-BR");

    acc[formattedDate] = (acc[formattedDate] || 0) + curr.totalAmount;
    return acc;
  }, {});

  // Formata dados para o gráfico
  const chartData: DailySalesData[] = Object.entries(dailyData)
    .map(([date, total]) => ({
      date,
      // Converte a data para objeto Date para ordenação
      rawDate: date.split("/").reverse().join("-"),
      total,
    }))
    .sort(
      (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
    )
    .map(({ date, total }) => ({ date, total }));

  // Função customizada para renderizar labels dos valores
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const xPos = x + width / 2;
    const yPos = y + height / 2;

    return (
      <text
        x={xPos}
        y={yPos}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="bold"
      >
        {formatPrice(value)}
      </text>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ bottom: 40, top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatPrice(value)}
          />
          <Tooltip
            formatter={(value: number) => [formatPrice(value), "Valor Vendido"]}
            labelFormatter={(label) => `Data: ${label}`}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "14px",
              fontWeight: "500",
              paddingTop: "10px",
            }}
          />
          <Bar
            dataKey="total"
            fill="#059669"
            radius={[4, 4, 0, 0]}
            name="Valor Vendido"
          >
            <LabelList content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
