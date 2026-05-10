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

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs"
      style={{
        background: 'rgba(28,28,52,0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="mb-1.5 font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.fill }} />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{p.name === 'income' ? 'Receita' : 'Despesa'}:</span>
          <span className="font-bold" style={{ color: p.fill }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex h-[220px] items-center justify-center rounded-xl text-sm"
        style={{ border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
      >
        Sem dados disponíveis
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={3} barSize={14}>
          <XAxis
            dataKey="month"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}
          />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontFamily: 'inherit' }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}
          />
          <Bar dataKey="income"  name="income"  fill="oklch(0.75 0.18 140)" radius={[4, 4, 0, 0]} opacity={0.85} />
          <Bar dataKey="expense" name="expense" fill="#f43f5e"               radius={[4, 4, 0, 0]} opacity={0.7}  />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
