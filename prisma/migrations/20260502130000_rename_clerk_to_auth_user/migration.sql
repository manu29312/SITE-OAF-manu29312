ALTER TABLE "User" RENAME COLUMN "clerkId" TO "authUserId";
ALTER INDEX "User_clerkId_key" RENAME TO "User_authUserId_key";
