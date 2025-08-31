import { and, between, count, desc, eq, sql } from "drizzle-orm";
import type {
	BookmarkFilters,
	BookmarkResponse,
	CreateBookmarkRequest,
	UpdateBookmarkRequest,
} from "@/types/bookmark";
import { FALLBACK_CATEGORY } from "./ai-prompts";
import { categorizeBookmark, isAIServiceConfigured } from "./ai-service";
import { db } from "./db";
import { bookmarks, bookmarkTags, tags } from "./schema";

export class BookmarkService {
	async createBookmark(data: CreateBookmarkRequest): Promise<BookmarkResponse> {
		const existingBookmark = await this.findByUrl(data.url);
		if (existingBookmark) {
			throw new Error("Bookmark with this URL already exists");
		}

		// Determine AI category - either use provided one or categorize automatically
		let aiCategory = data.aiCategory;
		let aiConfidence: number | null = null;

		if (!aiCategory && isAIServiceConfigured()) {
			try {
				console.log(`Attempting AI categorization for: ${data.url}`);
				const categorization = await categorizeBookmark({
					url: data.url,
					title: data.title,
					description: data.description,
				});

				aiCategory = categorization.category;
				// Convert confidence from float (0.0-1.0) to integer (0-100) for SQLite
				aiConfidence = Math.round(categorization.confidence * 100);

				console.log(
					`AI categorization result: ${aiCategory} (confidence: ${aiConfidence}%)`,
				);
			} catch (error) {
				console.warn("AI categorization failed, using fallback:", error);
				aiCategory = FALLBACK_CATEGORY;
				aiConfidence = 0;
			}
		} else if (!aiCategory) {
			// No AI service configured and no category provided
			aiCategory = FALLBACK_CATEGORY;
			aiConfidence = 0;
		}

		const [bookmark] = await db
			.insert(bookmarks)
			.values({
				url: data.url,
				title: data.title,
				description: data.description,
				faviconUrl: data.faviconUrl,
				notes: data.notes,
				aiCategory,
				aiConfidence,
			})
			.returning();

		if (data.tags && data.tags.length > 0) {
			await this.addTagsToBookmark(bookmark.id, data.tags);
		}

		return this.getBookmarkWithTags(bookmark.id);
	}

	async getBookmark(id: number): Promise<BookmarkResponse | null> {
		return this.getBookmarkWithTags(id);
	}

	async updateBookmark(
		id: number,
		data: UpdateBookmarkRequest,
	): Promise<BookmarkResponse> {
		const existingBookmark = await db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.id, id))
			.limit(1);
		if (existingBookmark.length === 0) {
			throw new Error("Bookmark not found");
		}

		const updateData: Partial<typeof bookmarks.$inferInsert> = {};
		if (data.title !== undefined) updateData.title = data.title;
		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.faviconUrl !== undefined) updateData.faviconUrl = data.faviconUrl;
		if (data.aiCategory !== undefined) updateData.aiCategory = data.aiCategory;
		if (data.notes !== undefined) updateData.notes = data.notes;
		updateData.updatedAt = new Date().toISOString();

		await db.update(bookmarks).set(updateData).where(eq(bookmarks.id, id));

		if (data.tags !== undefined) {
			await this.updateBookmarkTags(id, data.tags);
		}

		return this.getBookmarkWithTags(id);
	}

	async deleteBookmark(id: number): Promise<void> {
		const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
		if (result.rowsAffected === 0) {
			throw new Error("Bookmark not found");
		}
	}

	/**
	 * Re-categorize an existing bookmark using AI
	 */
	async recategorizeBookmark(id: number): Promise<BookmarkResponse> {
		const bookmark = await this.getBookmark(id);
		if (!bookmark) {
			throw new Error("Bookmark not found");
		}

		if (!isAIServiceConfigured()) {
			throw new Error("AI service not configured");
		}

		try {
			console.log(`Re-categorizing bookmark: ${bookmark.url}`);
			const categorization = await categorizeBookmark({
				url: bookmark.url,
				title: bookmark.title ?? undefined,
				description: bookmark.description ?? undefined,
			});

			// Convert confidence from float (0.0-1.0) to integer (0-100) for SQLite
			const confidenceInt = Math.round(categorization.confidence * 100);

			await db
				.update(bookmarks)
				.set({
					aiCategory: categorization.category,
					aiConfidence: confidenceInt,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(bookmarks.id, id));

			console.log(
				`Re-categorization complete: ${categorization.category} (confidence: ${confidenceInt}%)`,
			);

			return this.getBookmarkWithTags(id);
		} catch (error) {
			console.error("Failed to re-categorize bookmark:", error);
			throw new Error(
				`Re-categorization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Batch re-categorize multiple bookmarks
	 */
	async recategorizeBookmarksBatch(ids: number[]): Promise<BookmarkResponse[]> {
		if (!isAIServiceConfigured()) {
			throw new Error("AI service not configured");
		}

		const results: BookmarkResponse[] = [];

		for (const id of ids) {
			try {
				const result = await this.recategorizeBookmark(id);
				results.push(result);
			} catch (error) {
				console.error(`Failed to re-categorize bookmark ${id}:`, error);
				// Continue with other bookmarks even if one fails
				const bookmark = await this.getBookmark(id);
				if (bookmark) {
					results.push(bookmark);
				}
			}
		}

		return results;
	}

	async listBookmarks(filters: BookmarkFilters): Promise<{
		bookmarks: BookmarkResponse[];
		total: number;
		page: number;
		limit: number;
		hasMore: boolean;
	}> {
		const {
			page = 1,
			limit = 20,
			search,
			// tags, // TODO: Implement tag filtering in future iteration
			category,
			dateFrom,
			dateTo,
		} = filters;
		const offset = (page - 1) * limit;

		const conditions = [
			...(search
				? [
						sql`(${bookmarks.title} LIKE ${`%${search}%`} OR ${bookmarks.description} LIKE ${`%${search}%`})`,
					]
				: []),
			...(category ? [eq(bookmarks.aiCategory, category)] : []),
			...(dateFrom && dateTo
				? [between(bookmarks.createdAt, dateFrom, dateTo)]
				: []),
			...(dateFrom && !dateTo
				? [sql`${bookmarks.createdAt} >= ${dateFrom}`]
				: []),
			...(!dateFrom && dateTo
				? [sql`${bookmarks.createdAt} <= ${dateTo}`]
				: []),
		];

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [totalResult] = await db
			.select({ count: count() })
			.from(bookmarks)
			.where(whereClause);
		const total = totalResult.count;

		const bookmarkResults = await db
			.select()
			.from(bookmarks)
			.where(whereClause)
			.orderBy(desc(bookmarks.createdAt))
			.limit(limit)
			.offset(offset);

		const bookmarksWithTags = await Promise.all(
			bookmarkResults.map((bookmark) => this.getBookmarkWithTags(bookmark.id)),
		);

		return {
			bookmarks: bookmarksWithTags,
			total,
			page,
			limit,
			hasMore: offset + limit < total,
		};
	}

	async findByUrl(url: string): Promise<BookmarkResponse | null> {
		const [bookmark] = await db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.url, url))
			.limit(1);
		if (!bookmark) return null;
		return this.getBookmarkWithTags(bookmark.id);
	}

	private async getBookmarkWithTags(
		bookmarkId: number,
	): Promise<BookmarkResponse> {
		const [bookmark] = await db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.id, bookmarkId))
			.limit(1);
		if (!bookmark) {
			throw new Error("Bookmark not found");
		}

		const bookmarkTagsResult = await db
			.select({ tag: tags })
			.from(bookmarkTags)
			.innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
			.where(eq(bookmarkTags.bookmarkId, bookmarkId));

		return {
			...bookmark,
			tags: bookmarkTagsResult.map((bt) => bt.tag),
		};
	}

	private async addTagsToBookmark(
		bookmarkId: number,
		tagNames: string[],
	): Promise<void> {
		for (const tagName of tagNames) {
			let tag = await db
				.select()
				.from(tags)
				.where(eq(tags.name, tagName))
				.limit(1);

			if (tag.length === 0) {
				const [newTag] = await db
					.insert(tags)
					.values({ name: tagName })
					.returning();
				tag = [newTag];
			}

			await db
				.insert(bookmarkTags)
				.values({
					bookmarkId,
					tagId: tag[0].id,
				})
				.onConflictDoNothing();
		}
	}

	private async updateBookmarkTags(
		bookmarkId: number,
		tagNames: string[],
	): Promise<void> {
		await db
			.delete(bookmarkTags)
			.where(eq(bookmarkTags.bookmarkId, bookmarkId));
		if (tagNames.length > 0) {
			await this.addTagsToBookmark(bookmarkId, tagNames);
		}
	}
}
