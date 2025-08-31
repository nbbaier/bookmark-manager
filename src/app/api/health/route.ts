import { NextResponse } from "next/server";
import client from "@/lib/db";

export async function GET() {
	try {
		// Test database connection
		await client.execute("SELECT 1");

		return NextResponse.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			database: "connected",
			message: "Bookmark Organizer is running successfully",
		});
	} catch (error) {
		console.error("Health check failed:", error);

		return NextResponse.json(
			{
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				database: "disconnected",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
