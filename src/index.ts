import express from "express";
import { UsersController } from "./resources/users/controllers";

async function bootstrap(){
  console.log(`[+] starting...`);

  const app = express();
  app.use(express.json());


  app.use('/api/users', new UsersController().getRouter());
  app.listen(3000, async () => {
    console.log('[+] listening on port 3000');
  });
}

bootstrap().catch(err => {
  console.error(`[-] error: ${err}`);
})
