import type { Bookmark, Tag } from "@/lib/schema";

export interface CreateBookmarkRequest {
	url: string;
	title?: string;
	description?: string;
	faviconUrl?: string;
	aiCategory?: string;
	notes?: string;
	tags?: string[];
}

export interface UpdateBookmarkRequest {
	title?: string;
	description?: string;
	faviconUrl?: string;
	aiCategory?: string;
	notes?: string;
	tags?: string[];
}

export interface BookmarkResponse extends Bookmark {
	tags: Tag[];
}

export interface BookmarkListResponse {
	bookmarks: BookmarkResponse[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface BookmarkFilters {
	search?: string;
	tags?: string[];
	category?: string;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	limit?: number;
}

export interface WebhookSaveBookmarkRequest {
	url: string;
	title?: string;
	tags?: string;
}

export interface WebhookSaveBookmarkResponse {
	id: number;
	url: string;
	title?: string;
	message: string;
}
