import { PrismaClient } from "@prisma/client";
import { PrismaSingleton } from "../../../dbpool/singleton";

export class InvitesService {
  constructor(private prisma: PrismaClient = PrismaSingleton.getInstance()) {
  }


  async createInvite() {
    const uniqueCode = Math.random().toString(36).slice(2, 7);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    const newInvite = await this.prisma.invite.create({
      data: {
        code: uniqueCode,
        expiresAt,
      }
    });
    return newInvite;
  }

  async validateInvite(code: string) {
    const invite = await this.prisma.invite.findUnique({
      where: {
        code: code,
      }
    });
    if (!invite) {
      throw new Error('Invite not found');
    }
    if (invite.expiresAt < new Date()) {
      throw new Error('Invite expired');
    }
    return invite;
  }
}
