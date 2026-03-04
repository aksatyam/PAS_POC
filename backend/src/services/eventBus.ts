import { EventEmitter } from 'events';
import { Response } from 'express';

class EventBus extends EventEmitter {
  private sseClients: Map<string, Response> = new Map();

  addSSEClient(clientId: string, res: Response): void {
    this.sseClients.set(clientId, res);

    res.on('close', () => {
      this.sseClients.delete(clientId);
    });
  }

  removeSSEClient(clientId: string): void {
    this.sseClients.delete(clientId);
  }

  getConnectedCount(): number {
    return this.sseClients.size;
  }

  broadcast(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [clientId, res] of this.sseClients) {
      try {
        res.write(payload);
      } catch {
        this.sseClients.delete(clientId);
      }
    }
  }
}

export const eventBus = new EventBus();

// Relay 'activity' events to all SSE clients
eventBus.on('activity', (entry) => {
  eventBus.broadcast('activity', entry);
});
