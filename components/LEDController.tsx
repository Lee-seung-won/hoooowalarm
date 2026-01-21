'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { SerialConnection } from '@/lib/serial';

interface LEDControllerProps {
  serial: SerialConnection;
  isConnected: boolean;
}

export default function LEDController({ serial, isConnected }: LEDControllerProps) {
  const [color, setColor] = useState('#ff0000');
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    const newRgb = hexToRgb(newColor);
    setRgb(newRgb);
  };

  const handleSendColor = async () => {
    if (!isConnected) {
      alert('먼저 장치를 연결하세요.');
      return;
    }

    try {
      await serial.sendCommand(`L${rgb.r},${rgb.g},${rgb.b}`);
    } catch (error: any) {
      alert(`LED 설정 실패: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-200">LED 설정</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-700"
          />
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-2">RGB 값</div>
            <div className="text-lg font-mono text-gray-200">
              R: <span className="text-red-400">{rgb.r}</span> G:{' '}
              <span className="text-green-400">{rgb.g}</span> B:{' '}
              <span className="text-blue-400">{rgb.b}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSendColor}
          disabled={!isConnected}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          LED 색상 전송
        </button>
      </div>
    </div>
  );
}
