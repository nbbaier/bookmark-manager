import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db";

export async function runMigrations(): Promise<void> {
	try {
		console.log("🚀 Starting Drizzle migrations...");

		// Drizzle will automatically run migrations from the drizzle folder
		await migrate(db, { migrationsFolder: "./drizzle" });

		console.log("✅ Drizzle migrations completed successfully");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		throw error;
	}
}

export async function resetDatabase(): Promise<void> {
	try {
		console.log("🔄 Resetting database...");

		// Drop all tables using Drizzle
		const { bookmarks, tags, bookmarkTags, bookmarksFts } = await import(
			"./schema"
		);

		await db.delete(bookmarkTags);
		await db.delete(bookmarksFts);
		await db.delete(tags);
		await db.delete(bookmarks);

		console.log("✅ Database reset completed");
	} catch (error) {
		console.error("❌ Database reset failed:", error);
		throw error;
	}
}
