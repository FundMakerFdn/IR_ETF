import { WebSocket } from "ws";
import { Protocol, RateUpdate } from "@shared/schema";
import { protocolService } from "../services/protocolService";

export class RateUpdater {
  private clients: Set<WebSocket>;

  constructor() {
    this.clients = new Set();
  }

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    ws.send(JSON.stringify({ type: "CONNECTED" }));
  }

  removeClient(ws: WebSocket): void {
    this.clients.delete(ws);
  }

  async handleUpdate(message: string, ws: WebSocket): Promise<void> {
    try {
      const update = JSON.parse(message) as RateUpdate;

      // Validate required fields
      if (!update.protocolId || typeof update.rate !== 'number' || !update.timestamp) {
        throw new Error('Invalid update format: missing required fields');
      }

      const protocol = await protocolService.updateRate(update);
      await this.broadcastUpdate(protocol);
    } catch (error) {
      this.sendError(ws, error);
    }
  }

  private async broadcastUpdate(protocol: Protocol): Promise<void> {
    const ldri = await protocolService.calculateLDRI();
    const message = JSON.stringify({
      type: "RATE_UPDATE",
      data: { protocol, ldri }
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private sendError(ws: WebSocket, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    ws.send(JSON.stringify({
      type: "ERROR",
      message: errorMessage
    }));
  }
}

export const rateUpdater = new RateUpdater();