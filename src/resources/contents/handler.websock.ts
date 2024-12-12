import { Post } from "@prisma/client";
import { ContentEvent, EventNames } from "../../events-emitters";
import { WSSNamespace } from "../../plugins/wss-namespaces/wss-namespace";
import { WebSocket } from "ws";

export class ContentsWSNamespace extends WSSNamespace {
  public _namespace = "/ws/consume/content";
  static connections: Array<WebSocket> = [];

  public onConnection(socket: WebSocket): void {
    console.log(`[*] new socket connection added.`);
    ContentsWSNamespace.connections.push(socket);

    socket.on("message", (message) => {
      console.log(`[+] Message in ${this._namespace}: ${message}`);
      socket.send(`Hello from ContentsWSNamespace! Received: ${message}`);
    });

    socket.on("close", () => {
      console.log(`[-] Client disconnected from ${this._namespace}`);
    });
  }
}

ContentEvent.on(EventNames.content_uploaded, async (data: string) => {
  const post: Post = JSON.parse(data);
  console.info(`[+] Broadcasting content ${data}`);
  ContentsWSNamespace.connections.forEach((socket) => {
    socket.send(data);
  })
})

