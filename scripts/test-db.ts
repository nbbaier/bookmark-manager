#!/usr/bin/env node

import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import { bookmarks, bookmarkTags, tags } from "../src/lib/schema";

async function testDatabase() {
	try {
		console.log("🔍 Testing database connection and tables...");

		// Test basic connection by querying bookmarks table
		const bookmarkCount = await db
			.select({ count: sql`count(*)` })
			.from(bookmarks);
		console.log("✅ Database connection successful");

		// Check what tables exist by trying to query them
		try {
			const tagsCount = await db.select({ count: sql`count(*)` }).from(tags);
			console.log("✅ Tags table accessible");
		} catch (error) {
			console.log("❌ Tags table not accessible:", error);
		}

		try {
			const bookmarkTagsCount = await db
				.select({ count: sql`count(*)` })
				.from(bookmarkTags);
			console.log("✅ Bookmark tags table accessible");
		} catch (error) {
			console.log("❌ Bookmark tags table not accessible:", error);
		}

		// Show current data counts
		console.log("📊 Current data counts:");
		console.log(`   Bookmarks: ${bookmarkCount[0].count}`);
	} catch (error) {
		console.error("❌ Database test failed:", error);
	}
}

testDatabase();
