'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { SerialMessage } from '@/lib/serial';

interface DebugLogsProps {
  messages: SerialMessage[];
}

export default function DebugLogs({ messages }: DebugLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-200">Debug Logs</h2>
      </div>

      <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {messages.length === 0 ? (
          <div className="text-gray-600 text-center py-8">
            로그가 없습니다. 장치를 연결하면 여기에 메시지가 표시됩니다.
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-1 ${
                msg.type === 'in' ? 'text-green-400' : 'text-blue-400'
              }`}
            >
              <span className="text-gray-500">[{formatTime(msg.timestamp)}]</span>{' '}
              <span className={msg.type === 'in' ? 'text-green-400' : 'text-blue-400'}>
                {msg.type === 'in' ? '←' : '→'}
              </span>{' '}
              <span>{msg.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
