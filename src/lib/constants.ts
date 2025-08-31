/**
 * Configuration constants for the bookmark manager application
 */

/**
 * Maximum number of bookmarks to process concurrently for AI categorization
 * This helps prevent API rate limiting and ensures optimal performance
 */
export const MAX_CONCURRENT_CATEGORIZATIONS = parseInt(
	process.env.MAX_CONCURRENT_CATEGORIZATIONS || "3"
);

/**
 * Default AI categories for bookmark classification
 */
export const DEFAULT_AI_CATEGORIES = [
	"Development",
	"Design",
	"Business",
	"Education",
	"Technology",
	"News",
	"Entertainment",
	"Health",
	"Finance",
	"Productivity",
	"Social",
	"Uncategorized",
] as const;

/**
 * Timeout for AI categorization requests (in milliseconds)
 */
export const AI_CATEGORIZATION_TIMEOUT = parseInt(
	process.env.AI_CATEGORIZATION_TIMEOUT || "30000"
);