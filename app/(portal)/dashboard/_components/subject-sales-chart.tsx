/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SerializedTransaction } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface SubjectSalesData {
  name: string;
  quantity: number;
  percentage: number;
}

interface SubjectSalesChartProps {
  transactions: SerializedTransaction[];
}

// Cores para o gráfico de pizza
const COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#dbeafe",
  "#f59e0b",
  "#fbbf24",
  "#fcd34d",
  "#fde68a",
  "#fef3c7",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#fecaca",
  "#fee2e2",
];

export function SubjectSalesChart({ transactions }: SubjectSalesChartProps) {
  // Agrupa vendas por assunto
  const subjectSales = transactions.reduce(
    (acc: Record<string, SubjectSalesData>, curr) => {
      const subject = curr.book.subject || "Não informado";

      if (!acc[subject]) {
        acc[subject] = {
          name: subject,
          quantity: 0,
          percentage: 0,
        };
      }
      acc[subject].quantity += curr.quantity;
      return acc;
    },
    {}
  );

  // Calcula total e percentuais
  const totalQuantity = Object.values(subjectSales).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Converte para array, calcula percentuais e ordena
  const chartData = Object.values(subjectSales)
    .map((item) => ({
      ...item,
      percentage: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8); // TOP 8 para não poluir o gráfico

  // Função customizada para renderizar labels
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }: any) => {
    if (percentage < 5) return null; // Não mostrar label se muito pequeno

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="quantity"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} unidades`,
              name,
            ]}
            labelFormatter={(label) => `Assunto: ${label}`}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "10px",
            }}
            formatter={(value) =>
              value.length > 20 ? `${value.substring(0, 20)}...` : value
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
