/*
  Warnings:

  - You are about to alter the column `client_name` on the `oauth_client` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - Made the column `client_uri` on table `oauth_client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `oauth_client` MODIFY `client_name` VARCHAR(20) NOT NULL,
    MODIFY `client_uri` VARCHAR(2048) NOT NULL,
    MODIFY `logo_uri` VARCHAR(2048) NOT NULL,
    MODIFY `tos_uri` VARCHAR(2048) NULL,
    MODIFY `policy_uri` VARCHAR(2048) NULL,
    MODIFY `jwks_uri` VARCHAR(2048) NULL;
