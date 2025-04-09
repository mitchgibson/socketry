// src/app/Server.ts
import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(join(__dirname, "..")));
  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });
  app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
  });
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
  server.listen(3e3, () => {
    console.log("server running at http://localhost:3000");
  });
}

// src/index.ts
startServer();
//# sourceMappingURL=index.js.map
