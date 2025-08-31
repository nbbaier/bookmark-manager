import { type NextRequest, NextResponse } from "next/server";
import { BookmarkService } from "@/lib/bookmark-service";
import { bookmarkFiltersSchema, createBookmarkSchema } from "@/lib/validation";
import type { BookmarkFilters } from "@/types/bookmark";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const filters = Object.fromEntries(searchParams.entries());

		const validationResult = bookmarkFiltersSchema.safeParse(filters);
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "Invalid filters", details: validationResult.error.issues },
				{ status: 400 },
			);
		}

		const validatedFilters: BookmarkFilters = {
			...validationResult.data,
			tags: validationResult.data.tags
				? validationResult.data.tags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0)
				: undefined,
		};

		const bookmarkService = new BookmarkService();
		const result = await bookmarkService.listBookmarks(validatedFilters);

		return NextResponse.json(result);
	} catch (error) {
		console.error("List bookmarks error:", error);
		return NextResponse.json(
			{ error: "Failed to list bookmarks" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const validationResult = createBookmarkSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: validationResult.error.issues },
				{ status: 400 },
			);
		}

		const bookmarkService = new BookmarkService();
		const bookmark = await bookmarkService.createBookmark(
			validationResult.data,
		);

		return NextResponse.json(bookmark, { status: 201 });
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === "Bookmark with this URL already exists"
		) {
			return NextResponse.json(
				{ error: "Bookmark with this URL already exists" },
				{ status: 409 },
			);
		}

		console.error("Create bookmark error:", error);
		return NextResponse.json(
			{ error: "Failed to create bookmark" },
			{ status: 500 },
		);
	}
}
