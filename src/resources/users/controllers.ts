import { config } from "../../config";
import { InvitesService } from "./invites/service";
import { UserService, AccountType } from "./service";
import { Request, Response, Router } from "express";

export class UsersController {
  private router: Router;

  constructor(private userService: UserService = new UserService(), private inviteService: InvitesService = new InvitesService()) {
    this.router = Router();
    this.initializeRoutes();
  }


  private login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { user, userSession } = await this.userService.login(email, password);
      const sessionData = {
        email: user.email,
        sessionValidity: userSession.sessionValidity,
        token: userSession.token,
        role: user.accountType
      }
      res.status(201).json(sessionData);
      return;
    } catch (error: any) {
      res.status(400).json({ message: error.message });
      return;
    }
  }

  private registration = async (req: Request, res: Response) => {
    try {
      const { email, password, inviteCode } = req.body;
      const user = await this.userService.registration(email, password, inviteCode);
      res.status(201).json({email, accountType: user.accountType});
      return;
    } catch (error: any) {
      res.status(400).json({ message: error.message });
      return;
    }
  }

  private createInvites = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { user } = await this.userService.login(
        email, password
      )
      if (!user) {
        throw new Error("user not found");
      }
      if (user.accountType === AccountType.uploader) {
        const invite = await this.inviteService.createInvite();
        res.status(201).json(invite);
        return;
      }
      throw new Error("cannot create invite");
    } catch (error: any) {
      res.status(404).json({ message: error.message })
      return;
    }
  }

  private upgradeUserRole = async (req: Request, res: Response) => {
    try {
      const { email, password, aesKey } = req.body;
      if (aesKey !== config.AES256KEY) {
        throw new Error("invalid key");
      }
      const user = await this.userService.login(email, password);
      if (!user) {
        throw new Error("user not found");
      }
      await this.userService.upgradeToUploader(email);

      res.status(201).json({ message: "upgraded to uploader" });
      return;
    } catch (error: any) {
      res.status(400).json({ message: error.message });
      return;
    }
  }

  private initializeRoutes(): void {
    this.router.post("/registration", this.registration);
    this.router.post("/upgrade", this.upgradeUserRole);
    this.router.post("/login", this.login);
    this.router.post("/create-invite", this.createInvites);
  }

  public getRouter(): Router {
    return this.router;
  }
}
