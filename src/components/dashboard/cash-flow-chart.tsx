'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface CashFlowChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
            width={80}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => formatCurrency(Number(value))}
          />
          <Bar
            dataKey="income"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            name="Income"
          />
          <Bar
            dataKey="expense"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            name="Expense"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
