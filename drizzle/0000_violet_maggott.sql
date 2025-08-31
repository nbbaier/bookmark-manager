CREATE TABLE `bookmark_tags` (
	`bookmark_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_bookmark_tags_bookmark_id` ON `bookmark_tags` (`bookmark_id`);--> statement-breakpoint
CREATE INDEX `idx_bookmark_tags_tag_id` ON `bookmark_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX `pk_bookmark_tags` ON `bookmark_tags` (`bookmark_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`description` text,
	`favicon_url` text,
	`ai_category` text DEFAULT 'Uncategorized',
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookmarks_url_unique` ON `bookmarks` (`url`);--> statement-breakpoint
CREATE INDEX `idx_bookmarks_url` ON `bookmarks` (`url`);--> statement-breakpoint
CREATE INDEX `idx_bookmarks_ai_category` ON `bookmarks` (`ai_category`);--> statement-breakpoint
CREATE INDEX `idx_bookmarks_created_at` ON `bookmarks` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_bookmarks_updated_at` ON `bookmarks` (`updated_at`);--> statement-breakpoint
CREATE TABLE `bookmarks_fts` (
	`title` text,
	`description` text
);
--> statement-breakpoint
CREATE INDEX `idx_bookmarks_fts` ON `bookmarks_fts` (`title`,`description`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#3B82F6',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_tags_name` ON `tags` (`name`);