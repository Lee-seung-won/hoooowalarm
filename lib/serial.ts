export interface SerialMessage {
  type: 'in' | 'out';
  message: string;
  timestamp: Date;
}

export class SerialConnection {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private onMessage: ((msg: SerialMessage) => void) | null = null;
  private onGraphData: ((value: number) => void) | null = null;
  private isReading = false;
  private isDisconnecting = false;

  async connect(): Promise<string> {
    if (typeof window === 'undefined' || !('serial' in navigator)) {
      throw new Error('Web Serial API가 지원되지 않는 브라우저입니다.');
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      
      if (!this.port.writable || !this.port.readable) {
        throw new Error('포트의 읽기/쓰기 스트림을 열 수 없습니다.');
      }
      
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      
      this.startReading();
      
      return this.port.getInfo().usbVendorId 
        ? `USB Device (VID: ${this.port.getInfo().usbVendorId})`
        : 'Serial Port';
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        throw new Error('포트를 선택하지 않았습니다.');
      }
      throw error;
    }
  }

  private async startReading() {
    if (!this.reader) return;
    
    this.isReading = true;
    const decoder = new TextDecoder();
    let buffer = '';

    while (this.isReading) {
      try {
        const { value, done } = await this.reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          this.onMessage?.({ type: 'in', message: trimmed, timestamp: new Date() });

          // GRAPH_H:값 파싱
          if (trimmed.startsWith('GRAPH_H:')) {
            const value = parseFloat(trimmed.split(':')[1]);
            if (!isNaN(value)) {
              this.onGraphData?.(value);
            }
          }
        }
      } catch (error) {
        console.error('Read error:', error);
        break;
      }
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.writer) {
      throw new Error('장치가 연결되지 않았습니다.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(command + '\n');
    await this.writer.write(data);
    
    this.onMessage?.({ type: 'out', message: command, timestamp: new Date() });
  }

  async disconnect(): Promise<void> {
    // 이미 해제 중이면 무시
    if (this.isDisconnecting) {
      return;
    }

    this.isDisconnecting = true;
    this.isReading = false;
    
    try {
      // Reader 정리
      if (this.reader) {
        try {
          await this.reader.cancel();
        } catch (error) {
          // 이미 취소되었거나 에러가 발생해도 계속 진행
          console.warn('Reader cancel error:', error);
        }
        try {
          await this.reader.releaseLock();
        } catch (error) {
          // 이미 해제되었거나 에러가 발생해도 계속 진행
          console.warn('Reader release error:', error);
        }
        this.reader = null;
      }
      
      // Writer 정리
      if (this.writer) {
        try {
          await this.writer.releaseLock();
        } catch (error) {
          // 이미 해제되었거나 에러가 발생해도 계속 진행
          console.warn('Writer release error:', error);
        }
        this.writer = null;
      }
      
      // Port 닫기
      if (this.port) {
        try {
          // 포트가 이미 닫혔는지 확인
          if (this.port.readable !== null || this.port.writable !== null) {
            await this.port.close();
          }
        } catch (error: any) {
          // "already in progress" 에러는 무시
          if (error.message && error.message.includes('already in progress')) {
            console.warn('Port close already in progress');
          } else {
            throw error;
          }
        }
        this.port = null;
      }
    } finally {
      this.isDisconnecting = false;
    }
  }

  setOnMessage(callback: (msg: SerialMessage) => void) {
    this.onMessage = callback;
  }

  setOnGraphData(callback: (value: number) => void) {
    this.onGraphData = callback;
  }

  isConnected(): boolean {
    return this.port !== null && !this.isDisconnecting && this.port.readable !== null && this.port.writable !== null;
  }

  getIsDisconnecting(): boolean {
    return this.isDisconnecting;
  }
}
