import { PrismaClient } from "@prisma/client";
import { PrismaSingleton } from "../../dbpool/singleton";
import { InvitesService } from "./invites/service";

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
    console.log(`invite code: `, invite.code, " expires at: ", invite.expiresAt);
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
    return this.prisma.user.findUnique({ where: { email, password } });
  }

  async createInitUploader() {
    const newUploader = await this.prisma.user.create({
      data: {
        email: "sourav@default.com",
        password: "abcd_-_1000",
        accountType: AccountType.uploader
      }
    })
    return newUploader;
  }
}
