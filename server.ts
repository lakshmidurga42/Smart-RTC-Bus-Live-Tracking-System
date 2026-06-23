import express from "express";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("rtc.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT,
    start_stop TEXT,
    end_stop TEXT
  );

  CREATE TABLE IF NOT EXISTS stops (
    id TEXT PRIMARY KEY,
    name TEXT,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS route_stops (
    route_id TEXT,
    stop_id TEXT,
    sequence INTEGER,
    FOREIGN KEY(route_id) REFERENCES routes(id),
    FOREIGN KEY(stop_id) REFERENCES stops(id)
  );

  CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    route_id TEXT,
    number TEXT,
    capacity INTEGER,
    FOREIGN KEY(route_id) REFERENCES routes(id)
  );

  CREATE TABLE IF NOT EXISTS gps_logs (
    bus_id TEXT,
    lat REAL,
    lng REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bus_id) REFERENCES buses(id)
  );
`);

// Seed Data
const seed = () => {
  const routesCount = db.prepare("SELECT COUNT(*) as count FROM routes").get() as { count: number };
  if (routesCount.count === 0) {
    db.prepare("INSERT INTO routes (id, name, start_stop, end_stop) VALUES (?, ?, ?, ?)").run("R1", "216 - Miyapur to Secunderabad", "Miyapur", "Secunderabad");
    db.prepare("INSERT INTO routes (id, name, start_stop, end_stop) VALUES (?, ?, ?, ?)").run("R2", "218 - Patancheru to Koti", "Patancheru", "Koti");

    db.prepare("INSERT INTO stops (id, name, lat, lng) VALUES (?, ?, ?, ?)").run("S1", "Miyapur X Road", 17.4948, 78.3498);
    db.prepare("INSERT INTO stops (id, name, lat, lng) VALUES (?, ?, ?, ?)").run("S2", "Hydernagar", 17.4930, 78.3600);
    db.prepare("INSERT INTO stops (id, name, lat, lng) VALUES (?, ?, ?, ?)").run("S3", "JNTU", 17.4933, 78.3915);
    db.prepare("INSERT INTO stops (id, name, lat, lng) VALUES (?, ?, ?, ?)").run("S4", "Kukatpally", 17.4841, 78.4126);

    db.prepare("INSERT INTO buses (id, route_id, number, capacity) VALUES (?, ?, ?, ?)").run("B1", "R1", "TS09UA1234", 50);
    db.prepare("INSERT INTO buses (id, route_id, number, capacity) VALUES (?, ?, ?, ?)").run("B2", "R1", "TS09UA5678", 50);
  }
};
seed();

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  app.use(express.json());

  // API Routes
  app.get("/api/routes", (req, res) => {
    const routes = db.prepare("SELECT * FROM routes").all();
    res.json(routes);
  });

  app.get("/api/buses", (req, res) => {
    const buses = db.prepare(`
      SELECT b.*, r.name as route_name 
      FROM buses b 
      JOIN routes r ON b.route_id = r.id
    `).all();
    res.json(buses);
  });

  app.get("/api/stops", (req, res) => {
    const stops = db.prepare("SELECT * FROM stops").all();
    res.json(stops);
  });

  // Real-time Bus Simulation
  const busStates: Record<string, { lat: number, lng: number, speed: number, crowd: number }> = {
    "B1": { lat: 17.4948, lng: 78.3498, speed: 30, crowd: 20 },
    "B2": { lat: 17.4933, lng: 78.3915, speed: 25, crowd: 45 }
  };

  setInterval(() => {
    Object.keys(busStates).forEach(busId => {
      const state = busStates[busId];
      // Simple movement simulation towards a target or just random jitter for demo
      state.lat += (Math.random() - 0.5) * 0.001;
      state.lng += (Math.random() - 0.5) * 0.001;
      state.crowd = Math.max(0, Math.min(50, state.crowd + (Math.random() > 0.5 ? 1 : -1)));
      
      // Broadcast to all connected clients
      const message = JSON.stringify({
        type: "BUS_UPDATE",
        payload: { busId, ...state }
      });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }, 3000);

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    ws.send(JSON.stringify({ type: "INIT", payload: { busStates } }));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
