import { PrismaClient } from "@prisma/client";
import { PrismaSingleton } from "../../dbpool/singleton";
import { InvitesService } from "./invites/service";
import { randomUUID } from "crypto";

export enum AccountType {
  viewer = "viewer",
  uploader = "uploader",
}

export class UserService {
  constructor(private prisma: PrismaClient = PrismaSingleton.getInstance(),
    private inviteService: InvitesService = new InvitesService()
  ) {

  }

  async registration(email: string, password: string, inviteCode: string) {
    const invite = await this.inviteService.validateInvite(inviteCode);

    if (invite.expiresAt < new Date()) {
      throw new Error("invite expired");
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password,
        accountType: AccountType.viewer
      }
    });
    return newUser;
  }


  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email, password } });
    if (!user) {
      throw new Error(`invalid credentials`);
    }

    const uniqueCode: string = randomUUID().toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const userSession = await this.prisma.userSession.create({
      data: {
        email: user.email,
        sessionValidity: expiresAt,
        token: uniqueCode
      }
    });

    return {
      user,
      userSession
    }
  }

  async userViaSession(token: string) {
    const userSession = await this.prisma.userSession.findFirst({
      where: {
        token
      }
    });

    if (!userSession) {
      throw new Error(`invalid session`);
    }

    if (userSession.sessionValidity < new Date()) {
      throw new Error(`session expired`);
    }

    const user = await this.prisma.user.findUnique({ where: { email: userSession.email } });
    return user;
  }


}
