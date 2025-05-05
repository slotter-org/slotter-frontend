import axiosClient from './axiosClient';
import { getToken } from '@/services/StorageService';

class SSEService {
  private eventSource: EventSource | null = null;

  public connect(): void {
    const token = getToken();
    if (!token) {
      console.warn('[SSEService] No token found, skipping SSE connect.');
      return;
    }

    const baseURL = axiosClient.defaults.baseURL || '/api';
    const url = `${baseURL}/sse/stream?token=${encodeURIComponent(token)}`;

    console.debug('[SSEService] Connecting to SSE =>', url);
    this.eventSource = new EventSource(url);
  }

  public onOpen(callback: (e: Event) => void): void {
    if (!this.eventSource) return;
    this.eventSource.onopen = callback;
  }

  // We only handle the default "message" event, so we use .onmessage
  public onMessage(callback: (e: MessageEvent) => void): void {
    if (!this.eventSource) return;
    this.eventSource.onmessage = callback;  // catches "event: message"
  }

  public onError(callback: (e: Event) => void): void {
    if (!this.eventSource) return;
    this.eventSource.onerror = callback;
  }

  public close(): void {
    if (this.eventSource) {
      console.debug('[SSEService] Closing SSE stream.');
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public async subscribe(channel: string): Promise<void> {
    if (!channel) {
      console.warn('[SSEService] subscribe called with empty channel.');
      return;
    }
    await axiosClient.post('/sse/subscribe', { channel });
    console.debug('[SSEService] Subscribed to channel:', channel);
  }

  public async unsubscribe(channel: string): Promise<void> {
    if (!channel) {
      console.warn('[SSEService] unsubscribe called with empty channel.');
      return;
    }
    await axiosClient.post('/sse/unsubscribe', { channel });
    console.debug('[SSEService] Unsubscribed from channel:', channel);
  }
}

export default new SSEService();
