-- CreateTable
CREATE TABLE `oauth_client` (
    `client_id` VARCHAR(191) NOT NULL,
    `client_name` VARCHAR(191) NOT NULL,
    `client_secret` VARCHAR(191) NOT NULL,
    `client_uri` VARCHAR(191) NULL,
    `contacts` JSON NULL,
    `logo_uri` VARCHAR(191) NOT NULL DEFAULT 'app/icon/default.png',
    `tos_uri` VARCHAR(191) NULL,
    `policy_uri` VARCHAR(191) NULL,
    `jwks_uri` VARCHAR(191) NULL,
    `redirect_uri` JSON NOT NULL,
    `token_endpoint_auth_method` VARCHAR(191) NOT NULL DEFAULT 'client_secret_post',
    `respons_type` VARCHAR(191) NOT NULL DEFAULT 'code',
    `grant_types` JSON NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`client_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `oauth_client` ADD CONSTRAINT `oauth_client_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
