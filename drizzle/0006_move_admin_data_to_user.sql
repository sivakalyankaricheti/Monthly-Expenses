INSERT INTO `tracker_state` (`user_id`,`data`,`updated_at`)
SELECT 'mzll6UGvqFvra8c1By5f2Vz9yBs4F1QHOLSFeQfyvy9LLEhmlm0f9a', `data`, `updated_at`
FROM `tracker_state` WHERE `user_id` = 'platform-admin'
ON CONFLICT(`user_id`) DO UPDATE SET `data`=excluded.`data`,`updated_at`=excluded.`updated_at`;
--> statement-breakpoint
DELETE FROM `tracker_state` WHERE `user_id` = 'platform-admin';
