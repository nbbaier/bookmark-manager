#!/usr/bin/env node

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function createTables() {
	try {
		console.log("🏗️ Creating database tables...");

		// Create tags table
		await db.run(sql`
			CREATE TABLE IF NOT EXISTS tags (
				id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
				name TEXT NOT NULL UNIQUE,
				color TEXT DEFAULT '#3B82F6',
				created_at TEXT DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Create bookmarks table
		await db.run(sql`
			CREATE TABLE IF NOT EXISTS bookmarks (
				id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
				url TEXT NOT NULL UNIQUE,
				title TEXT,
				description TEXT,
				favicon_url TEXT,
				ai_category TEXT DEFAULT 'Uncategorized',
				notes TEXT,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Create bookmark_tags table
		await db.run(sql`
			CREATE TABLE IF NOT EXISTS bookmark_tags (
				bookmark_id INTEGER NOT NULL,
				tag_id INTEGER NOT NULL,
				FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
				FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
				PRIMARY KEY (bookmark_id, tag_id)
			)
		`);

		// Create indexes
		await db.run(sql`CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks (url)`);
		await db.run(sql`CREATE INDEX IF NOT EXISTS idx_bookmarks_ai_category ON bookmarks (ai_category)`);
		await db.run(sql`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name)`);
		await db.run(sql`CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags (bookmark_id)`);
		await db.run(sql`CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags (tag_id)`);

		console.log("✅ Database tables created successfully!");

	} catch (error) {
		console.error("❌ Failed to create tables:", error);
		process.exit(1);
	}
}

createTables();