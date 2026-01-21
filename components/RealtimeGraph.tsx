'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface GraphDataPoint {
  time: string;
  value: number;
}

interface RealtimeGraphProps {
  data: number | null;
}

// Recharts 차트를 별도 컴포넌트로 분리하여 dynamic import
const ChartComponent = dynamic(
  () => import('./ChartComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center text-gray-500">
        차트 로딩 중...
      </div>
    )
  }
);

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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">실시간 그래프</h2>
      <div className="h-64 w-full">
        <ChartComponent data={graphData} />
      </div>
      {graphData.length > 0 && (
        <div className="mt-2 text-sm text-gray-400">
          최신 값: <span className="text-blue-400 font-medium">{graphData[graphData.length - 1].value}</span>
        </div>
      )}
    </div>
  );
}
