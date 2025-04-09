import express, { Request, Response } from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

export function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  
  // Serve static files from the dist directory
  app.use(express.static(join(__dirname, "..")));

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });

  app.get("/", (req: Request, res: Response) => {
    res.send("<h1>Hello world</h1>");
  });

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
  });
}
