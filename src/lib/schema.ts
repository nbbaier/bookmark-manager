import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookmarks = sqliteTable(
	"bookmarks",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		url: text("url").notNull().unique(),
		title: text("title"),
		description: text("description"),
		faviconUrl: text("favicon_url"),
		aiCategory: text("ai_category").default("Uncategorized"),
		notes: text("notes"),
		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => ({
		urlIdx: index("idx_bookmarks_url").on(table.url),
		categoryIdx: index("idx_bookmarks_ai_category").on(table.aiCategory),
		createdAtIdx: index("idx_bookmarks_created_at").on(table.createdAt),
		updatedAtIdx: index("idx_bookmarks_updated_at").on(table.updatedAt),
	}),
);

export const tags = sqliteTable(
	"tags",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull().unique(),
		color: text("color").default("#3B82F6"),
		createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => ({
		nameIdx: index("idx_tags_name").on(table.name),
	}),
);

export const bookmarkTags = sqliteTable(
	"bookmark_tags",
	{
		bookmarkId: integer("bookmark_id")
			.notNull()
			.references(() => bookmarks.id, { onDelete: "cascade" }),
		tagId: integer("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => ({
		bookmarkIdIdx: index("idx_bookmark_tags_bookmark_id").on(table.bookmarkId),
		tagIdIdx: index("idx_bookmark_tags_tag_id").on(table.tagId),
		pk: index("pk_bookmark_tags").on(table.bookmarkId, table.tagId),
	}),
);

// Full-text search table using FTS5
export const bookmarksFts = sqliteTable(
	"bookmarks_fts",
	{
		title: text("title"),
		description: text("description"),
	},
	(table) => ({
		ftsIdx: index("idx_bookmarks_fts").on(table.title, table.description),
	}),
);

// Types for TypeScript
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type BookmarkTag = typeof bookmarkTags.$inferSelect;
export type NewBookmarkTag = typeof bookmarkTags.$inferInsert;
