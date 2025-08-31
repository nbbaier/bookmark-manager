#!/usr/bin/env node

import { resetDatabase, runMigrations } from "@/lib/migrations";

async function main() {
	const command = process.argv[2];

	try {
		switch (command) {
			case "up":
				console.log("Running database migrations...");
				await runMigrations();
				console.log("✅ Migrations completed successfully");
				break;

			case "reset":
				console.log("Resetting database...");
				await resetDatabase();
				console.log("✅ Database reset completed");
				break;

			case "status":
				console.log("Migration status command not implemented yet");
				break;

			default:
				console.log("Usage: npm run migrate <command>");
				console.log("");
				console.log("Commands:");
				console.log("  up     Run pending migrations");
				console.log("  reset  Reset database (drop all tables)");
				console.log("  status Show migration status");
				console.log("");
				console.log("Examples:");
				console.log("  npm run migrate up");
				console.log("  npm run migrate reset");
				process.exit(1);
		}
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

main();
