/*
  Warnings:

  - You are about to drop the column `email` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `Invite` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Invite" ("code", "createdAt", "expiresAt", "id") SELECT "code", "createdAt", "expiresAt", "id" FROM "Invite";
DROP TABLE "Invite";
ALTER TABLE "new_Invite" RENAME TO "Invite";
CREATE UNIQUE INDEX "Invite_code_key" ON "Invite"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
