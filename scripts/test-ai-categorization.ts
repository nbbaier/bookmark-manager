#!/usr/bin/env node

import { BookmarkService } from "../src/lib/bookmark-service";
import { MAX_CONCURRENT_CATEGORIZATIONS } from "../src/lib/constants";
import { db } from "../src/lib/db";
import { bookmarks } from "../src/lib/schema";

async function testAICategorization() {
	console.log("🤖 Testing AI Categorization with batch processing");
	console.log(`📊 Batch size (MAX_CONCURRENT_CATEGORIZATIONS): ${MAX_CONCURRENT_CATEGORIZATIONS}`);
	console.log();

	try {
		const bookmarkService = new BookmarkService();

		// Check how many bookmarks exist
		const allBookmarks = await db.select().from(bookmarks);
		console.log(`📚 Total bookmarks in database: ${allBookmarks.length}`);
		
		const uncategorizedCount = allBookmarks.filter(b => b.aiCategory === 'Uncategorized').length;
		console.log(`🔍 Uncategorized bookmarks: ${uncategorizedCount}`);
		console.log();

		if (uncategorizedCount > 0) {
			console.log("🏃 Running AI categorization...");
			await bookmarkService.categorizeUncategorizedBookmarks();
			
			// Check results
			const updatedBookmarks = await db.select().from(bookmarks);
			console.log();
			console.log("📋 Categorization results:");
			updatedBookmarks.forEach((bookmark, index) => {
				console.log(`   ${index + 1}. ${bookmark.title || bookmark.url}`);
				console.log(`      Category: ${bookmark.aiCategory}`);
				console.log();
			});
		} else {
			console.log("✅ All bookmarks are already categorized!");
		}

		console.log("✅ AI categorization test completed successfully!");
		console.log("📈 Configuration used:");
		console.log(`   - MAX_CONCURRENT_CATEGORIZATIONS: ${MAX_CONCURRENT_CATEGORIZATIONS}`);
		console.log("   - This prevents overwhelming the AI service with too many concurrent requests");
		console.log("   - Can be configured via environment variable MAX_CONCURRENT_CATEGORIZATIONS");

	} catch (error) {
		console.error("❌ AI categorization test failed:", error);
		process.exit(1);
	}
}

testAICategorization();