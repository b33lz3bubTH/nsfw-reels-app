import { WebSocket, Server as WebSocketServer } from "ws";
import { Server as HttpServer } from "http"; // Correct type for HTTP server

export abstract class WSSNamespace {
  abstract _namespace: string;

  public initialize(server: HttpServer) {
    const wsServer = new WebSocketServer({ noServer: true });

    // Attach upgrade listener to HTTP server
    server.on("upgrade", (req, socket, head) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      if (url.pathname === this._namespace) {
        wsServer.handleUpgrade(req, socket, head, (ws) => {
          wsServer.emit("connection", ws, req);
        });
      }
    });

    // Handle WebSocket connections
    wsServer.on("connection", (socket: WebSocket) => {
      console.log(`[+] Client connected to ${this._namespace}`);
      this.onConnection(socket);
    });
  }

  // Abstract method to handle connection logic
  abstract onConnection(socket: WebSocket): void;
}
