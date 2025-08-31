import { and, between, count, desc, eq, sql } from "drizzle-orm";
import type {
	BookmarkFilters,
	BookmarkResponse,
	CreateBookmarkRequest,
	UpdateBookmarkRequest,
} from "@/types/bookmark";
import { db } from "./db";
import { bookmarks, bookmarkTags, tags } from "./schema";

export class BookmarkService {
	async createBookmark(data: CreateBookmarkRequest): Promise<BookmarkResponse> {
		const existingBookmark = await this.findByUrl(data.url);
		if (existingBookmark) {
			throw new Error("Bookmark with this URL already exists");
		}

		const [bookmark] = await db
			.insert(bookmarks)
			.values({
				url: data.url,
				title: data.title,
				description: data.description,
				faviconUrl: data.faviconUrl,
				notes: data.notes,
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
