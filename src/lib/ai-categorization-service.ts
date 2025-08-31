import { MAX_CONCURRENT_CATEGORIZATIONS } from "./constants";

export interface BookmarkCategorization {
	id: number;
	url: string;
	title?: string;
	description?: string;
	suggestedCategory: string;
	confidence: number;
}

export interface AICategorizationService {
	categorizeBookmarks(bookmarks: Array<{
		id: number;
		url: string;
		title?: string;
		description?: string;
	}>): Promise<BookmarkCategorization[]>;
}

/**
 * Mock AI categorization service for development
 * In production, this would integrate with a real AI service like OpenAI or Anthropic
 */
export class MockAICategorizationService implements AICategorizationService {
	async categorizeBookmarks(bookmarks: Array<{
		id: number;
		url: string;
		title?: string;
		description?: string;
	}>): Promise<BookmarkCategorization[]> {
		// Process bookmarks in batches to respect concurrent limits
		const results: BookmarkCategorization[] = [];
		
		for (let i = 0; i < bookmarks.length; i += MAX_CONCURRENT_CATEGORIZATIONS) {
			const batch = bookmarks.slice(i, i + MAX_CONCURRENT_CATEGORIZATIONS);
			
			// Process batch concurrently
			const batchPromises = batch.map(async (bookmark) => {
				return this.categorizeSingleBookmark(bookmark);
			});
			
			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);
		}
		
		return results;
	}

	private async categorizeSingleBookmark(bookmark: {
		id: number;
		url: string;
		title?: string;
		description?: string;
	}): Promise<BookmarkCategorization> {
		// Simulate AI processing delay
		await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
		
		// Simple rule-based categorization for demo
		const category = this.determineCategoryFromContent(bookmark);
		
		return {
			id: bookmark.id,
			url: bookmark.url,
			title: bookmark.title,
			description: bookmark.description,
			suggestedCategory: category,
			confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
		};
	}

	private determineCategoryFromContent(bookmark: {
		url: string;
		title?: string;
		description?: string;
	}): string {
		const content = `${bookmark.url} ${bookmark.title || ''} ${bookmark.description || ''}`.toLowerCase();
		
		// Simple keyword-based categorization
		if (content.includes('github') || content.includes('code') || content.includes('dev') || 
			content.includes('programming') || content.includes('javascript') || 
			content.includes('typescript') || content.includes('react') || content.includes('api')) {
			return 'Development';
		}
		
		if (content.includes('design') || content.includes('figma') || content.includes('ui') || 
			content.includes('ux') || content.includes('color') || content.includes('font')) {
			return 'Design';
		}
		
		if (content.includes('business') || content.includes('marketing') || 
			content.includes('startup') || content.includes('entrepreneur')) {
			return 'Business';
		}
		
		if (content.includes('learn') || content.includes('tutorial') || content.includes('course') || 
			content.includes('education') || content.includes('university') || content.includes('study')) {
			return 'Education';
		}
		
		if (content.includes('tech') || content.includes('technology') || content.includes('ai') || 
			content.includes('machine learning') || content.includes('artificial intelligence')) {
			return 'Technology';
		}
		
		if (content.includes('news') || content.includes('article') || content.includes('blog') || 
			content.includes('medium') || content.includes('journalism')) {
			return 'News';
		}
		
		// Default category if no match
		return 'Uncategorized';
	}
}