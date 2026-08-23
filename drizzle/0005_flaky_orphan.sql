CREATE TABLE `password_reset_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text
);
--> statement-breakpoint
CREATE INDEX `password_reset_user_idx` ON `password_reset_tokens` (`user_id`);
--> statement-breakpoint
UPDATE `users` SET `role` = 'user' WHERE lower(`email`) <> 'admin@gmail.com';
--> statement-breakpoint
INSERT INTO `users` (`user_id`,`email`,`display_name`,`role`,`status`,`created_at`,`last_seen_at`,`password_hash`,`password_salt`)
VALUES ('platform-admin','admin@gmail.com','Administrator','admin','active','2026-08-23T15:50:00.000Z','2026-08-23T15:50:00.000Z','fcd3757bb17aaf30a3570ab51c5144ab303d8f54d1c638e7d0647df7a3d86aab','75ab0b199fe826154a66984e93ff59e3')
ON CONFLICT(`email`) DO UPDATE SET `role`='admin',`status`='active',`password_hash`=excluded.`password_hash`,`password_salt`=excluded.`password_salt`;
