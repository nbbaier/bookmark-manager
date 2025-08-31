import { z } from "zod";

export const createBookmarkSchema = z.object({
	url: z.string().url("Invalid URL format"),
	title: z.string().optional(),
	description: z.string().optional(),
	faviconUrl: z.string().url("Invalid favicon URL").optional(),
	notes: z.string().optional(),
	tags: z.array(z.string().min(1, "Tag cannot be empty")).optional(),
});

export const updateBookmarkSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	faviconUrl: z.string().url("Invalid favicon URL").optional(),
	aiCategory: z.string().optional(),
	notes: z.string().optional(),
	tags: z.array(z.string().min(1, "Tag cannot be empty")).optional(),
});

export const webhookSaveBookmarkSchema = z.object({
	url: z.string().url("Invalid URL format"),
	title: z.string().optional(),
	tags: z.string().optional().nullable(),
});

export const bookmarkFiltersSchema = z.object({
	search: z.string().optional(),
	tags: z.string().optional(),
	category: z.string().optional(),
	dateFrom: z.string().optional(),
	dateTo: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const bookmarkIdSchema = z.object({
	id: z.coerce.number().int().positive("Invalid bookmark ID"),
});
