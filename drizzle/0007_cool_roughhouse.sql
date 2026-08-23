CREATE TABLE `tracker_state_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tracker_state_history_user_created_idx` ON `tracker_state_history` (`user_id`,`created_at`);