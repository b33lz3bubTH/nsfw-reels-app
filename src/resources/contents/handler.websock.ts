import { Post } from "@prisma/client";
import { ContentEvent, EventNames } from "../../events-emitters";
import { WSSNamespace } from "../../plugins/wss-namespaces/wss-namespace";
import { WebSocket } from "ws";
import { Commands, appCommandConfigs } from "../../plugins/command-parser/app-commands";
import { CommandParser } from "../../plugins/command-parser/manager";
import { ContentService } from "./services";


export class ContentsWSNamespace extends WSSNamespace {
  public _namespace = "/ws/consume/content";
  static connections: Array<WebSocket> = [];
  private command_parser = new CommandParser(appCommandConfigs);

  constructor(public contentService = new ContentService()) {
    super();
  }

  public onConnection(socket: WebSocket): void {
    console.log(`[*] new socket connection added.`);
    ContentsWSNamespace.connections.push(socket);

    socket.on("message", async (message) => {
      console.log(`[+] Message in ${this._namespace}: ${message}`);
      const command = this.command_parser.parse(message.toString());

      if (command.command == Commands.consume_list) {
        const { take, skip } = command as any;
        console.log(`[+] take: ${take}, skip: ${skip}`);
        const posts = await this.contentService.consumePostsPagination(take, skip);
        socket.send(JSON.stringify(posts));
      }

    });

    socket.on("close", () => {
      console.log(`[-] Client disconnected from ${this._namespace}`);
    });
  }
}

ContentEvent.on(EventNames.content_uploaded, async (data: string) => {
  const post: Post = JSON.parse(data);
  console.info(`[+] Broadcasting content ${JSON.stringify(post)}`);
  ContentsWSNamespace.connections.forEach((socket) => {
    socket.send(data);
  })
})

