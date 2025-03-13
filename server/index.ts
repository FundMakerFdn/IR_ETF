import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { apiRouter } from "./api/routes";
import { rateUpdater } from "./websocket/rateUpdater";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging (simplified from original)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use("/api", apiRouter);

// Create HTTP server
const server = createServer(app);

// WebSocket setup
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  log("Client connected");
  rateUpdater.addClient(ws);

  ws.on("message", (message) => {
    rateUpdater.handleUpdate(message.toString(), ws);
  });

  ws.on("close", () => {
    log("Client disconnected");
    rateUpdater.removeClient(ws);
  });
});

// Setup Vite for development and error handling from original
(async () => {
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running on port ${port}`);
  });
})();