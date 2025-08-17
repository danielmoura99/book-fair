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

  // Calcula o total de livros vendidos
  const totalQuantity = transactions.reduce((sum, transaction) => sum + transaction.quantity, 0);

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
            tickFormatter={(value) => `${value} un`}
          />
          <Tooltip
            formatter={(value: number) => [`${value} unidades`, "Quantidade Vendida"]}
            labelFormatter={(label) => `Data: ${label}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend 
            wrapperStyle={{
              fontSize: '14px',
              fontWeight: '500',
              paddingTop: '10px'
            }}
          />
          <Bar
            dataKey="quantity"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            name="Quantidade Vendida"
          >
            <LabelList 
              dataKey="quantity" 
              position="center"
              style={{
                fill: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
