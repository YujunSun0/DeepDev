'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Session {
  id: string;
  score: number | null;
  createdAt: string;
}

interface GrowthChartProps {
  sessions: Session[];
}

function aggregateByDate(sessions: Session[]): { date: string; avgScore: number; count: number }[] {
  const withScore = sessions.filter((s) => s.score != null) as (Session & { score: number })[];
  const byDate = new Map<string, { sum: number; count: number }>();

  for (const s of withScore) {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const cur = byDate.get(key) ?? { sum: 0, count: 0 };
    cur.sum += s.score;
    cur.count += 1;
    byDate.set(key, cur);
  }

  return Array.from(byDate.entries())
    .map(([date, { sum, count }]) => ({
      date,
      avgScore: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function GrowthChart({ sessions }: GrowthChartProps) {
  const data = aggregateByDate(sessions);

  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
        <p className="text-sm text-gray-400">완료한 세션이 없습니다</p>
        <p className="mt-0.5 text-xs text-gray-300">학습을 완료하면 그래프가 표시됩니다</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: `${d.date.slice(5).replace('-', '/')}`,
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
            formatter={(value: number) => [`${value}점`, '평균 점수']}
            labelFormatter={(label) => `날짜: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="avgScore"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
