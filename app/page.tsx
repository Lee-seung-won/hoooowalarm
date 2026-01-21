'use client';

import { useState, useEffect, useCallback } from 'react';
import { SerialConnection, SerialMessage } from '@/lib/serial';
import DeviceConnection from '@/components/DeviceConnection';
import RealtimeGraph from '@/components/RealtimeGraph';
import AlarmManager from '@/components/AlarmManager';
import LEDController from '@/components/LEDController';
import DebugLogs from '@/components/DebugLogs';

export default function Home() {
  const [serial] = useState(() => new SerialConnection());
  const [isConnected, setIsConnected] = useState(false);
  const [graphData, setGraphData] = useState<number | null>(null);
  const [debugMessages, setDebugMessages] = useState<SerialMessage[]>([]);

  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `T${year}${month}${day}${hour}${minute}${second}`;
  };

  const sendTimeSync = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      const timeString = formatDateTime(new Date());
      await serial.sendCommand(timeString);
    } catch (error) {
      console.error('Time sync failed:', error);
    }
  }, [isConnected, serial]);

  useEffect(() => {
    serial.setOnMessage((msg) => {
      setDebugMessages((prev) => [...prev.slice(-99), msg]);
    });

    serial.setOnGraphData((value) => {
      setGraphData(value);
    });

    return () => {
      serial.disconnect().catch(console.error);
    };
  }, [serial]);

  useEffect(() => {
    if (isConnected) {
      // 연결 즉시 시간 동기화
      sendTimeSync();
      
      // 이후 1분마다 시간 동기화 (선택사항)
      const interval = setInterval(sendTimeSync, 60000);
      return () => clearInterval(interval);
    }
  }, [isConnected, sendTimeSync]);

  const handleConnect = (portInfo: string) => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setGraphData(null);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          스마트 폐활량 알람 시계 컨트롤러
        </h1>
        <p className="text-gray-400">
          Web Serial API를 통한 아두이노 제어
        </p>
      </div>

      <DeviceConnection
        serial={serial}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <RealtimeGraph data={graphData} />

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <AlarmManager serial={serial} isConnected={isConnected} />
        <LEDController serial={serial} isConnected={isConnected} />
      </div>

      <DebugLogs messages={debugMessages} />
    </main>
  );
}
