'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Recharts는 클라이언트 전용이므로 SSR 비활성화
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface GraphDataPoint {
  time: string;
  value: number;
}

interface RealtimeGraphProps {
  data: number | null;
}

export default function RealtimeGraph({ data }: RealtimeGraphProps) {
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const maxDataPoints = 50;
  const timeRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (data !== null && isMounted) {
      timeRef.current += 1;
      setGraphData((prev) => {
        const newData = [...prev, { time: `${timeRef.current}`, value: data }];
        if (newData.length > maxDataPoints) {
          return newData.slice(-maxDataPoints);
        }
        return newData;
      });
    }
  }, [data, isMounted]);

  if (!isMounted) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">실시간 그래프</h2>
        <div className="h-64 w-full flex items-center justify-center text-gray-500">
          차트 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">실시간 그래프</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {graphData.length > 0 && (
        <div className="mt-2 text-sm text-gray-400">
          최신 값: <span className="text-blue-400 font-medium">{graphData[graphData.length - 1].value}</span>
        </div>
      )}
    </div>
  );
}
