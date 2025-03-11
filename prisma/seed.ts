
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum AccountType {
  viewer = "viewer",
  uploader = "uploader",
}

async function createUser(email: string, accountType: AccountType) {
  const password = "password@secure";
  return await prisma.user.create({
    data: {
      email,
      password,
      accountType,
    }
  });
}

async function main() {
  const uploader = await createUser("uploader@system.com", AccountType.uploader);
  const viewer = await createUser("viewer@system.com", AccountType.viewer);

  console.log(`[+] uploader: `, uploader);
  console.log(`[+] viewer: `, viewer);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
