import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { BookmarkData } from "@/lib/ai-prompts";
import {
	categorizeBookmark,
	categorizeBookmarksBatch,
	isAIServiceConfigured,
} from "@/lib/ai-service";

/**
 * Request schema for single bookmark categorization
 */
const singleCategorizationSchema = z.object({
	url: z.string().url("Invalid URL format"),
	title: z.string().optional(),
	description: z.string().optional(),
});

/**
 * Request schema for batch bookmark categorization
 */
const batchCategorizationSchema = z.object({
	bookmarks: z.array(singleCategorizationSchema).min(1).max(10), // Limit batch size
});

/**
 * Union schema for both single and batch requests
 */
const requestSchema = z.union([
	singleCategorizationSchema,
	batchCategorizationSchema,
]);

/**
 * POST /api/ai/categorize
 *
 * Categorizes bookmarks using AI
 *
 * Request body:
 * - Single bookmark: { url, title?, description? }
 * - Batch: { bookmarks: [{ url, title?, description? }, ...] }
 *
 * Response:
 * - Single: { category, confidence, reasoning? }
 * - Batch: { results: [{ category, confidence, reasoning? }, ...] }
 */
export async function POST(request: NextRequest) {
	try {
		// Check if AI service is configured
		if (!isAIServiceConfigured()) {
			return NextResponse.json(
				{
					error: "AI service not configured",
					details: "OpenAI API key is missing",
				},
				{ status: 503 },
			);
		}

		// Parse request body
		const body = await request.json();
		const validationResult = requestSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid request format",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const data = validationResult.data;

		// Check if this is a batch request
		if ("bookmarks" in data) {
			// Batch categorization
			const bookmarks: BookmarkData[] = data.bookmarks;

			console.log(
				`Processing batch categorization for ${bookmarks.length} bookmarks`,
			);

			const results = await categorizeBookmarksBatch(bookmarks);

			return NextResponse.json({
				results,
				count: results.length,
			});
		} else {
			// Single bookmark categorization
			const bookmark: BookmarkData = data;

			console.log(`Processing single categorization for: ${bookmark.url}`);

			const result = await categorizeBookmark(bookmark);

			return NextResponse.json(result);
		}
	} catch (error) {
		console.error("Error in categorization API:", error);

		return NextResponse.json(
			{
				error: "Internal server error",
				details:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 },
		);
	}
}

/**
 * GET /api/ai/categorize
 *
 * Returns AI service status and configuration
 */
export async function GET() {
	try {
		const isConfigured = isAIServiceConfigured();

		return NextResponse.json({
			configured: isConfigured,
			available: isConfigured,
			message: isConfigured
				? "AI categorization service is available"
				: "AI categorization service requires OpenAI API key configuration",
		});
	} catch (error) {
		console.error("Error checking AI service status:", error);

		return NextResponse.json(
			{
				error: "Failed to check service status",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
