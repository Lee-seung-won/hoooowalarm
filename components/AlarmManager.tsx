'use client';

import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { SerialConnection } from '@/lib/serial';

interface Alarm {
  id: string;
  time: string; // HHMM 형식
}

interface AlarmManagerProps {
  serial: SerialConnection;
  isConnected: boolean;
}

export default function AlarmManager({ serial, isConnected }: AlarmManagerProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('30');

  const formatTime = (h: string, m: string): string => {
    return `${h.padStart(2, '0')}${m.padStart(2, '0')}`;
  };

  const formatDisplayTime = (time: string): string => {
    const h = time.substring(0, 2);
    const m = time.substring(2, 4);
    return `${h}:${m}`;
  };

  const handleAddAlarm = async () => {
    if (!isConnected) {
      alert('먼저 장치를 연결하세요.');
      return;
    }

    const time = formatTime(hour, minute);
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time,
    };

    try {
      await serial.sendCommand(`A${time}`);
      setAlarms([...alarms, newAlarm]);
      setHour('07');
      setMinute('30');
    } catch (error: any) {
      alert(`알람 추가 실패: ${error.message}`);
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    if (!isConnected) {
      alert('먼저 장치를 연결하세요.');
      return;
    }

    try {
      await serial.sendCommand('D');
      setAlarms(alarms.filter((alarm) => alarm.id !== id));
    } catch (error: any) {
      alert(`알람 삭제 실패: ${error.message}`);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-200">알람 관리</h2>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 items-center">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}시
              </option>
            ))}
          </select>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}분
              </option>
            ))}
          </select>
          <button
            onClick={handleAddAlarm}
            disabled={!isConnected}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 알람이 없습니다.
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-200 font-medium">
                  {formatDisplayTime(alarm.time)}
                </span>
              </div>
              <button
                onClick={() => handleDeleteAlarm(alarm.id)}
                disabled={!isConnected}
                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
