'use client';

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GraphDataPoint {
  time: string;
  value: number;
}

interface RealtimeGraphProps {
  data: number | null;
}

export default function RealtimeGraph({ data }: RealtimeGraphProps) {
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const maxDataPoints = 50;
  const timeRef = useRef(0);

  useEffect(() => {
    if (data !== null) {
      timeRef.current += 1;
      setGraphData((prev) => {
        const newData = [...prev, { time: `${timeRef.current}`, value: data }];
        if (newData.length > maxDataPoints) {
          return newData.slice(-maxDataPoints);
        }
        return newData;
      });
    }
  }, [data]);

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
