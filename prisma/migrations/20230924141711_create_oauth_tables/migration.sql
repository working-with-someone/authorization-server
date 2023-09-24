-- CreateTable
CREATE TABLE `oauth_client` (
    `id` VARCHAR(191) NOT NULL,
    `client_secret` VARCHAR(191) NOT NULL,
    `redirect_uri` VARCHAR(191) NOT NULL,
    `grant_type` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `oauth_client_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauth_access_token` (
    `access_token` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expired_at` DATETIME(3) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `oauth_access_token_user_id_key`(`user_id`),
    PRIMARY KEY (`access_token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauth_refresh_token` (
    `refresh_token` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `expired_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `oauth_refresh_token_user_id_key`(`user_id`),
    PRIMARY KEY (`refresh_token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauth_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `oauth_client` ADD CONSTRAINT `oauth_client_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_access_token` ADD CONSTRAINT `oauth_access_token_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_access_token` ADD CONSTRAINT `oauth_access_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_refresh_token` ADD CONSTRAINT `oauth_refresh_token_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_refresh_token` ADD CONSTRAINT `oauth_refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_user` ADD CONSTRAINT `oauth_user_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_user` ADD CONSTRAINT `oauth_user_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
