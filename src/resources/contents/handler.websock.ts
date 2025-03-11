import { Post } from "@prisma/client";
import { ContentEvent, EventNames } from "../../events-emitters";
import { WSSNamespace } from "../../plugins/wss-namespaces/wss-namespace";
import { WebSocket } from "ws";
import { Commands, appCommandConfigs } from "../../plugins/command-parser/app-commands";
import { CommandParser } from "../../plugins/command-parser/manager";
import { ContentService } from "./services";
import { UserService } from "../users/service";


export class ContentsWSNamespace extends WSSNamespace {
  public _namespace = "/ws/consume/content";
  static connections: Array<WebSocket> = [];
  private command_parser = new CommandParser(appCommandConfigs);

  constructor(public contentService = new ContentService(), public userService = new UserService()) {
    super();
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      console.log(`[+] Validating token: ${token}`);
      const user = await this.userService.userViaSession(token);
      return !!user;
    } catch (error: any) {
      return false;
    }
  }

  public onConnection(socket: WebSocket): void {
    console.log(`[*] new socket connection added.`);
    ContentsWSNamespace.connections.push(socket);

    socket.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log(`[+] Message in ${this._namespace}: ${message}`);
        const command = this.command_parser.parse(parsedMessage.command ?? "");
        console.log(`command`, command);

        if (command.command == Commands.consume_list) {
          const { take, skip } = command as any;
          console.log(`[+] take: ${take}, skip: ${skip}`);
          const posts = await this.contentService.consumePostsPagination(take, skip);
          const records = {
            name: "lists",
            posts: posts.map(p => { return { slug: p.slug, caption: p.caption, tags: p.tags, id: p.id } })
          }
          socket.send(JSON.stringify(records));
        }
      } catch (err) {
        console.log(`processing message err: `, err);
        socket.send(JSON.stringify({ name: "error", message: (err as any).message }));
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
    const records = {
      name: "new",
      post: {
        slug: post.slug,
        caption: post.caption,
        tags: post.tags,
        id: post.id
      }
    }

    socket.send(JSON.stringify(records));
  })
})

