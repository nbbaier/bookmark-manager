import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import {
	BOOKMARK_CATEGORIES,
	type BookmarkCategory,
	type BookmarkData,
	CATEGORIZATION_SYSTEM_PROMPT,
	type CategorizationResult,
	createCategorizationPrompt,
	FALLBACK_CATEGORY,
	isValidCategory,
	MIN_CONFIDENCE_THRESHOLD,
} from "./ai-prompts";

/**
 * Schema for AI categorization response
 */
const categorizationSchema = z.object({
	category: z.string(),
	confidence: z.number().min(0).max(1),
	reasoning: z.string().optional(),
});

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
	maxRequestsPerMinute: 10,
	requestTimestamps: [] as number[],
};

/**
 * Batch processing configuration
 */
const MAX_CONCURRENT_CATEGORIZATIONS = 3;

/**
 * Simple in-memory cache for AI responses
 */
interface CacheEntry {
	result: CategorizationResult;
	timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates a cache key from bookmark data
 */
function createCacheKey(bookmark: BookmarkData): string {
	const { url, title, description } = bookmark;
	return `${url}|${title || ""}|${description || ""}`;
}

/**
 * Checks if we're within rate limits
 */
function checkRateLimit(): boolean {
	const now = Date.now();
	const oneMinuteAgo = now - 60 * 1000;

	// Remove old timestamps
	RATE_LIMIT.requestTimestamps = RATE_LIMIT.requestTimestamps.filter(
		(timestamp) => timestamp > oneMinuteAgo,
	);

	return RATE_LIMIT.requestTimestamps.length < RATE_LIMIT.maxRequestsPerMinute;
}

/**
 * Records a new API request timestamp
 */
function recordRequest(): void {
	RATE_LIMIT.requestTimestamps.push(Date.now());
}

/**
 * Checks if cached result is still valid
 */
function getCachedResult(cacheKey: string): CategorizationResult | null {
	const cached = responseCache.get(cacheKey);
	if (!cached) return null;

	const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
	if (isExpired) {
		responseCache.delete(cacheKey);
		return null;
	}

	return cached.result;
}

/**
 * Caches a categorization result
 */
function cacheResult(cacheKey: string, result: CategorizationResult): void {
	responseCache.set(cacheKey, {
		result,
		timestamp: Date.now(),
	});
}

/**
 * Validates and sanitizes AI response
 */
function validateResponse(response: unknown): CategorizationResult {
	const parsed = categorizationSchema.parse(response);

	// Ensure category is valid
	if (!isValidCategory(parsed.category)) {
		console.warn(
			`Invalid category returned by AI: ${parsed.category}. Using fallback.`,
		);
		return {
			category: FALLBACK_CATEGORY,
			confidence: 0.3,
			reasoning: `AI returned invalid category "${parsed.category}". Using fallback.`,
		};
	}

	// Ensure confidence is reasonable
	if (parsed.confidence < MIN_CONFIDENCE_THRESHOLD) {
		console.warn(
			`Low confidence categorization: ${parsed.confidence}. Using fallback.`,
		);
		return {
			category: FALLBACK_CATEGORY,
			confidence: parsed.confidence,
			reasoning: parsed.reasoning || "Low confidence categorization",
		};
	}

	return {
		category: parsed.category as BookmarkCategory,
		confidence: parsed.confidence,
		reasoning: parsed.reasoning,
	};
}

/**
 * Main function to categorize a bookmark using AI
 */
export async function categorizeBookmark(
	bookmark: BookmarkData,
): Promise<CategorizationResult> {
	try {
		// Check cache first
		const cacheKey = createCacheKey(bookmark);
		const cachedResult = getCachedResult(cacheKey);
		if (cachedResult) {
			console.log("Using cached categorization result");
			return cachedResult;
		}

		// Check rate limits
		if (!checkRateLimit()) {
			console.warn("Rate limit exceeded for AI categorization");
			return {
				category: FALLBACK_CATEGORY,
				confidence: 0.0,
				reasoning: "Rate limit exceeded",
			};
		}

		// Check if API key is configured
		if (!process.env.OPENAI_API_KEY) {
			console.warn("OpenAI API key not configured");
			return {
				category: FALLBACK_CATEGORY,
				confidence: 0.0,
				reasoning: "OpenAI API key not configured",
			};
		}

		// Record the request
		recordRequest();

		// Call OpenAI API
		const result = await generateObject({
			model: openai("gpt-4o-mini"), // Use GPT-4o-mini which supports structured output
			system: CATEGORIZATION_SYSTEM_PROMPT,
			prompt: createCategorizationPrompt(bookmark),
			schema: categorizationSchema,
		});

		const categorization = validateResponse(result.object);

		// Cache the result
		cacheResult(cacheKey, categorization);

		console.log(
			`Successfully categorized bookmark: ${categorization.category} (confidence: ${categorization.confidence})`,
		);

		return categorization;
	} catch (error) {
		console.error("Error categorizing bookmark:", error);

		return {
			category: FALLBACK_CATEGORY,
			confidence: 0.0,
			reasoning: `AI categorization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Batch categorize multiple bookmarks
 */
export async function categorizeBookmarksBatch(
	bookmarks: BookmarkData[],
): Promise<CategorizationResult[]> {
	const results: CategorizationResult[] = [];

	// Process in small batches to avoid overwhelming the API
	const batchSize = MAX_CONCURRENT_CATEGORIZATIONS;

	for (let i = 0; i < bookmarks.length; i += batchSize) {
		const batch = bookmarks.slice(i, i + batchSize);

		// Process batch in parallel
		const batchPromises = batch.map((bookmark) => categorizeBookmark(bookmark));
		const batchResults = await Promise.all(batchPromises);

		results.push(...batchResults);

		// Add small delay between batches to be respectful to the API
		if (i + batchSize < bookmarks.length) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	return results;
}

/**
 * Get categorization statistics
 */
export function getCategorizationStats() {
	const cacheSize = responseCache.size;
	const recentRequests = RATE_LIMIT.requestTimestamps.length;

	return {
		cacheSize,
		recentRequests,
		availableCategories: BOOKMARK_CATEGORIES.length,
		fallbackCategory: FALLBACK_CATEGORY,
		minConfidenceThreshold: MIN_CONFIDENCE_THRESHOLD,
	};
}

/**
 * Clear the categorization cache
 */
export function clearCategorizationCache(): void {
	responseCache.clear();
	console.log("Categorization cache cleared");
}

/**
 * Check if AI service is properly configured
 */
export function isAIServiceConfigured(): boolean {
	return Boolean(process.env.OPENAI_API_KEY);
}
