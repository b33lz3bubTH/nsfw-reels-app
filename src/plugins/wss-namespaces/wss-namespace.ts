import { WebSocket, Server as WebSocketServer } from "ws";
import { Server as HttpServer } from "http";

export abstract class WSSNamespace {
  abstract _namespace: string;

  async initialize(server: HttpServer) {
    const wsServer = new WebSocketServer({ noServer: true });

    // Attach upgrade listener to HTTP server
    server.on("upgrade", (req, socket, head) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);

      if (url.pathname === this._namespace) {
        this.handleUpgradeRequest(req, socket, head);
      } else {
        this.unauthorized(socket);
      }
    });

    // Handle WebSocket connections
    wsServer.on("connection", (socket: WebSocket) => {
      console.log(`[+] Client connected to ${this._namespace}`);
      this.onConnection(socket);
    });
  }

  // Handle WebSocket upgrade request
  private async handleUpgradeRequest(req: any, socket: any, head: any) {
    const token = new URL(req.url || "", `http://${req.headers.host}`).searchParams.get('token');

    if (token) {
      try {
        const isValidToken = await this.validateToken(token);
        if (!isValidToken) {
          return this.unauthorized(socket);
        }

        const wsServer = new WebSocketServer({ noServer: true });
        wsServer.handleUpgrade(req, socket, head, (ws) => {
          wsServer.emit("connection", ws, req);
        });

      } catch (error: any) {
        console.log(`[-] Token validation failed: ${error.message}`);
        this.unauthorized(socket);
      }
    } else {
      this.unauthorized(socket);
    }
  }

  // Send unauthorized response and close the socket
  private unauthorized(socket: any) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }

  // Abstract method to handle connection logic
  abstract onConnection(socket: WebSocket): void;

  // Abstract method to validate token
  abstract validateToken(token: string): Promise<boolean>;
}
