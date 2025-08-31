/**
 * AI prompts for bookmark categorization
 */

export interface BookmarkData {
	url: string;
	title?: string;
	description?: string;
}

export interface CategorizationResult {
	category: string;
	confidence: number;
	reasoning?: string;
}

/**
 * Predefined categories for bookmark classification
 */
export const BOOKMARK_CATEGORIES = [
	"Development",
	"Design",
	"Business",
	"Education",
	"Entertainment",
	"News",
	"Shopping",
	"Social Media",
	"Tools & Utilities",
	"Health & Fitness",
	"Travel",
	"Food & Cooking",
	"Technology",
	"Finance",
	"Sports",
	"Science",
	"Arts & Culture",
	"Reference",
	"Documentation",
	"Uncategorized",
] as const;

export type BookmarkCategory = (typeof BOOKMARK_CATEGORIES)[number];

/**
 * System prompt for bookmark categorization
 */
export const CATEGORIZATION_SYSTEM_PROMPT = `You are an expert at categorizing bookmarks based on their URL, title, and description. 

Your task is to analyze the provided bookmark information and assign it to the most appropriate category from this predefined list:
${BOOKMARK_CATEGORIES.join(", ")}

Guidelines:
- Choose the MOST SPECIFIC category that fits the content
- If the content spans multiple categories, choose the PRIMARY one
- Use "Development" for programming, coding, software development content
- Use "Design" for UI/UX, graphic design, creative tools
- Use "Tools & Utilities" for productivity apps, browser extensions, general tools
- Use "Documentation" for official docs, API references, technical guides
- Use "Reference" for wikis, dictionaries, general reference materials
- Use "Technology" for tech news, hardware, general technology topics
- Use "Uncategorized" only when the content doesn't clearly fit any other category

Respond with a JSON object containing:
- category: string (must be exactly one of the predefined categories)
- confidence: number (0.0 to 1.0, where 1.0 is completely certain)
- reasoning: string (brief explanation of why this category was chosen)

Be decisive and confident in your categorization. Aim for confidence scores above 0.7 when possible.`;

/**
 * Creates a user prompt for bookmark categorization
 */
export function createCategorizationPrompt(bookmark: BookmarkData): string {
	const parts = [
		`URL: ${bookmark.url}`,
		bookmark.title && `Title: ${bookmark.title}`,
		bookmark.description && `Description: ${bookmark.description}`,
	].filter(Boolean);

	return `Please categorize this bookmark:\n\n${parts.join("\n")}`;
}

/**
 * Validates if a category is in the predefined list
 */
export function isValidCategory(
	category: string,
): category is BookmarkCategory {
	return BOOKMARK_CATEGORIES.includes(category as BookmarkCategory);
}

/**
 * Fallback category when AI categorization fails
 */
export const FALLBACK_CATEGORY: BookmarkCategory = "Uncategorized";

/**
 * Minimum confidence threshold for accepting AI categorization
 */
export const MIN_CONFIDENCE_THRESHOLD = 0.5;