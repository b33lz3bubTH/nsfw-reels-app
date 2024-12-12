import express from "express";
import { createServer } from "http";
import { WSServer } from "./plugins/wss-namespaces/ws-server";
import { UsersController } from "./resources/users/controllers";
import { ContentsControllers } from "./resources/contents/controllers";
import { ContentsWSNamespace } from "./resources/contents/handler.websock";

async function bootstrap() {
  console.log(`[+] starting...`);
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());


  app.use('/api/users', new UsersController().getRouter());
  app.use("/api/contents", new ContentsControllers().getRouter());

  const httpServer = createServer(app);

  const wsServer = new WSServer();
  wsServer.registerNamespace(new ContentsWSNamespace());
  await wsServer.initialize(httpServer);

  httpServer.listen(3000, async () => {
    console.log(`[+] Listening on port 3000`);
    console.log(`[+] WebSocket namespaces: /ws/[Server]`);
  });
}

bootstrap().catch(err => {
  console.error(`[-] error: ${err}`);
})
