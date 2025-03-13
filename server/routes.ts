import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertProtocolSchema, type RateUpdate } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Protocol routes
  app.get("/api/protocols", async (_req, res) => {
    const protocols = await storage.getProtocols();
    res.json(protocols);
  });

  app.post("/api/protocols", async (req, res) => {
    try {
      const protocol = insertProtocolSchema.parse(req.body);
      const created = await storage.createProtocol(protocol);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid protocol data" });
        return;
      }
      throw error;
    }
  });

  // Historical rates routes
  app.get("/api/rates/:protocolId", async (req, res) => {
    const protocolId = parseInt(req.params.protocolId);
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);

    if (isNaN(protocolId) || isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ message: "Invalid parameters" });
      return;
    }

    const rates = await storage.getHistoricalRates(protocolId, from, to);
    res.json(rates);
  });

  // WebSocket handling for real-time updates
  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
      try {
        const update = JSON.parse(message.toString()) as RateUpdate;
        const protocol = await storage.updateProtocolRate(update);

        // Broadcast update to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'RATE_UPDATE',
              data: protocol
            }));
          }
        });
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    // Send initial heartbeat
    ws.send(JSON.stringify({ type: 'CONNECTED' }));
  });

  return httpServer;
}