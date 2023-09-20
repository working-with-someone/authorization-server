/*
  Warnings:

  - You are about to drop the `oauth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `oauth` DROP FOREIGN KEY `Oauth_user_id_fkey`;

-- DropTable
DROP TABLE `oauth`;
