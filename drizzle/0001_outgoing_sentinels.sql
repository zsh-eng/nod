CREATE TABLE `episode_downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`episode_id` integer NOT NULL,
	`status` text NOT NULL,
	`current_bytes` integer NOT NULL,
	`total_bytes` integer NOT NULL,
	`file_uri` text NOT NULL,
	`last_activity_at` integer NOT NULL,
	`download_handle` text NOT NULL,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `episode_downloads_episode_id_unique` ON `episode_downloads` (`episode_id`);