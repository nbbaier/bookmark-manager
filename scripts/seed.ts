#!/usr/bin/env node

import { eq, sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import { bookmarks, bookmarkTags, tags } from "../src/lib/schema";

async function seedDatabase() {
	try {
		console.log("🌱 Seeding database with sample data...");

		// Insert sample tags
		const tagQueries = [
			["javascript", "#F59E0B"],
			["react", "#3B82F6"],
			["tutorial", "#10B981"],
			["development", "#8B5CF6"],
			["design", "#EF4444"],
		];

		for (const [name, color] of tagQueries) {
			try {
				await db.insert(tags).values({ name, color });
				console.log(`✅ Added tag: ${name}`);
			} catch (error) {
				if (
					error instanceof Error &&
					error.message.includes("UNIQUE constraint failed")
				) {
					console.log(`⚠️  Tag already exists: ${name}`);
				} else {
					throw error;
				}
			}
		}

		// Insert sample bookmarks
		const bookmarkQueries = [
			{
				url: "https://react.dev/learn",
				title: "React Tutorial - Learn React",
				description: "Official React tutorial for building user interfaces",
				aiCategory: "Development",
				tagNames: ["react", "tutorial", "development"],
			},
			{
				url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
				title: "JavaScript - MDN Web Docs",
				description: "Comprehensive JavaScript documentation and tutorials",
				aiCategory: "Development",
				tagNames: ["javascript", "tutorial", "development"],
			},
			{
				url: "https://tailwindcss.com/docs",
				title: "Tailwind CSS Documentation",
				description: "Utility-first CSS framework for rapid UI development",
				aiCategory: "Design",
				tagNames: ["design", "development"],
			},
			{
				url: "https://nextjs.org/docs",
				title: "Next.js Documentation",
				description: "The React framework for production",
				aiCategory: "Development",
				tagNames: ["react", "development"],
			},
			{
				url: "https://www.figma.com/",
				title: "Figma - Collaborative Interface Design Tool",
				description: "Professional design tool for teams",
				aiCategory: "Design",
				tagNames: ["design"],
			},
		];

		for (const bookmark of bookmarkQueries) {
			try {
				// Insert bookmark
				const result = await db
					.insert(bookmarks)
					.values({
						url: bookmark.url,
						title: bookmark.title,
						description: bookmark.description,
						aiCategory: bookmark.aiCategory,
					})
					.returning();

				const bookmarkId = result[0].id;
				console.log(`✅ Added bookmark: ${bookmark.title}`);

				// Add tags to bookmark
				for (const tagName of bookmark.tagNames) {
					try {
						const tagResult = await db
							.select()
							.from(tags)
							.where(eq(tags.name, tagName));

						if (tagResult.length > 0) {
							const tagId = tagResult[0].id;
							await db.insert(bookmarkTags).values({
								bookmarkId,
								tagId,
							});
						}
					} catch (error) {
						console.log(
							`⚠️  Could not add tag ${tagName} to bookmark ${bookmark.title}`,
						);
					}
				}
			} catch (error) {
				if (
					error instanceof Error &&
					error.message.includes("UNIQUE constraint failed")
				) {
					console.log(`⚠️  Bookmark already exists: ${bookmark.title}`);
				} else {
					console.log(`⚠️  Could not add bookmark: ${bookmark.title}`, error);
				}
			}
		}

		console.log("🎉 Database seeding completed successfully!");

		// Show summary
		const bookmarkCount = await db
			.select({ count: sql`count(*)` })
			.from(bookmarks);
		const tagCount = await db.select({ count: sql`count(*)` }).from(tags);

		console.log(`📊 Summary:`);
		console.log(`   Bookmarks: ${bookmarkCount[0].count}`);
		console.log(`   Tags: ${tagCount[0].count}`);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	}
}

seedDatabase();
