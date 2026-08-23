CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`role` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tracker_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tracker_state`("user_id", "data", "updated_at") SELECT '__LEGACY__', "data", "updated_at" FROM `tracker_state`;--> statement-breakpoint
DROP TABLE `tracker_state`;--> statement-breakpoint
ALTER TABLE `__new_tracker_state` RENAME TO `tracker_state`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
