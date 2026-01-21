'use client';

import { useState } from 'react';
import { Plug, PlugZap } from 'lucide-react';
import { SerialConnection } from '@/lib/serial';

interface DeviceConnectionProps {
  serial: SerialConnection;
  onConnect: (portInfo: string) => void;
  onDisconnect: () => void;
}

export default function DeviceConnection({ serial, onConnect, onDisconnect }: DeviceConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [portInfo, setPortInfo] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    if (typeof window === 'undefined' || !('serial' in navigator)) {
      alert('이 브라우저는 Web Serial API를 지원하지 않습니다.\nChrome, Edge, Opera를 사용해주세요.');
      return;
    }

    setIsConnecting(true);
    try {
      const info = await serial.connect();
      setIsConnected(true);
      setPortInfo(info);
      onConnect(info);
    } catch (error: any) {
      alert(`연결 실패: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (isDisconnecting) {
      return; // 이미 해제 중이면 무시
    }

    setIsDisconnecting(true);
    try {
      await serial.disconnect();
      setIsConnected(false);
      setPortInfo('');
      onDisconnect();
    } catch (error: any) {
      // 에러가 발생해도 상태는 초기화
      setIsConnected(false);
      setPortInfo('');
      onDisconnect();
      console.error('Disconnect error:', error);
      // 사용자에게는 조용히 처리 (이미 해제되었을 수 있음)
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <PlugZap className="w-6 h-6 text-green-500" />
          ) : (
            <Plug className="w-6 h-6 text-gray-500" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-300">
              {isConnected ? '연결됨' : '연결 안 됨'}
            </div>
            {isConnected && portInfo && (
              <div className="text-xs text-gray-500 mt-1">{portInfo}</div>
            )}
          </div>
        </div>
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting || isDisconnecting}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isConnected
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isConnecting 
            ? '연결 중...' 
            : isDisconnecting 
            ? '해제 중...' 
            : isConnected 
            ? '연결 해제' 
            : '장치 연결'}
        </button>
      </div>
    </div>
  );
}
