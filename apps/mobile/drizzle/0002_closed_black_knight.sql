PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`podcast_id` integer,
	`author` text,
	`content_encoded` text,
	`description` text,
	`enclosure_url` text,
	`enclosure_type` text,
	`guid` text NOT NULL,
	`itunes_author` text,
	`itunes_duration` real,
	`itunes_episode` integer,
	`itunes_episode_type` text,
	`itunes_explicit` integer,
	`itunes_image` text,
	`itunes_season` integer,
	`itunes_subtitle` text,
	`itunes_summary` text,
	`itunes_title` text,
	`link` text,
	`pub_date` text NOT NULL,
	`title` text NOT NULL,
	`pub_date_timestamp` integer NOT NULL,
	FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_episodes`("id", "podcast_id", "author", "content_encoded", "description", "enclosure_url", "enclosure_type", "guid", "itunes_author", "itunes_duration", "itunes_episode", "itunes_episode_type", "itunes_explicit", "itunes_image", "itunes_season", "itunes_subtitle", "itunes_summary", "itunes_title", "link", "pub_date", "title", "pub_date_timestamp") SELECT "id", "podcast_id", "author", "content_encoded", "description", "enclosure_url", "enclosure_type", "guid", "itunes_author", "itunes_duration", "itunes_episode", "itunes_episode_type", "itunes_explicit", "itunes_image", "itunes_season", "itunes_subtitle", "itunes_summary", "itunes_title", "link", "pub_date", "title", "pub_date_timestamp" FROM `episodes`;--> statement-breakpoint
DROP TABLE `episodes`;--> statement-breakpoint
ALTER TABLE `__new_episodes` RENAME TO `episodes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `pub_date_timestamp` ON `episodes` (`pub_date_timestamp`);--> statement-breakpoint
CREATE INDEX `nod_date_updated` ON `podcasts` (`nod_date_updated`);