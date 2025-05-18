/*
  Warnings:

  - You are about to drop the column `emailValidated` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailValidated",
ADD COLUMN     "emailVerified" TIMESTAMP(3);
