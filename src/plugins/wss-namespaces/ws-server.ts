
import { Server as HttpServer } from "http"; // Correct import for HTTP server
import { WSSNamespace } from "./wss-namespace";

export class WSServer {
  private namespaces: WSSNamespace[] = [];

  // Register a namespace
  public registerNamespace(_namespace: WSSNamespace) {
    this.namespaces.push(_namespace);
  }

  // Initialize WebSocket server on the provided HTTP server
  public async initialize(server: HttpServer) {
    this.namespaces.forEach(async (_namespace) => {
      await _namespace?.initialize(server);
    });
  }
}
