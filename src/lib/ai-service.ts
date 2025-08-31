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
 * Maximum number of concurrent categorizations to process at once.
 * 
 * This constant replaces the previous magic number "3" to make the batch size
 * configurable and more maintainable. The value controls how many bookmarks
 * are processed in parallel during batch operations to prevent overwhelming
 * the AI service and respect rate limits.
 * 
 * @constant {number}
 * @default 3
 */
export const MAX_CONCURRENT_CATEGORIZATIONS = 3;

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
 * Mock categorization function for development/testing when AI service is not available
 */
function mockCategorization(bookmark: BookmarkData): CategorizationResult {
	// Simple URL-based categorization logic for fallback
	const url = bookmark.url.toLowerCase();
	
	if (url.includes('github.com') || url.includes('stackoverflow.com') || url.includes('developer.mozilla.org')) {
		return { category: "Development", confidence: 0.8, reasoning: "URL contains development-related domain" };
	}
	if (url.includes('figma.com') || url.includes('dribbble.com') || url.includes('behance.com')) {
		return { category: "Design", confidence: 0.8, reasoning: "URL contains design-related domain" };
	}
	if (url.includes('docs.') || url.includes('documentation')) {
		return { category: "Documentation", confidence: 0.7, reasoning: "URL appears to be documentation" };
	}
	
	return {
		category: FALLBACK_CATEGORY,
		confidence: 0.3,
		reasoning: "Unable to categorize without AI service - using fallback",
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

		// Check if AI service is configured (OpenAI API key)
		if (!process.env.OPENAI_API_KEY) {
			console.warn("OpenAI API key not configured, using mock categorization");
			const result = mockCategorization(bookmark);
			cacheResult(cacheKey, result);
			return result;
		}

		// For now, use mock categorization until AI SDK is properly integrated
		// TODO: Implement actual AI categorization with OpenAI when dependencies are available
		console.log("AI service not yet fully implemented, using mock categorization");
		const result = mockCategorization(bookmark);
		cacheResult(cacheKey, result);
		return result;

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
 * Batch categorize multiple bookmarks with controlled concurrency
 */
export async function categorizeBookmarksBatch(
	bookmarks: BookmarkData[],
): Promise<CategorizationResult[]> {
	const results: CategorizationResult[] = [];

	// Process in small batches using MAX_CONCURRENT_CATEGORIZATIONS to avoid overwhelming the API
	const batchSize = MAX_CONCURRENT_CATEGORIZATIONS;

	for (let i = 0; i < bookmarks.length; i += batchSize) {
		const batch = bookmarks.slice(i, i + batchSize);

		// Process batch in parallel with controlled concurrency
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
		maxConcurrentCategorizations: MAX_CONCURRENT_CATEGORIZATIONS,
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