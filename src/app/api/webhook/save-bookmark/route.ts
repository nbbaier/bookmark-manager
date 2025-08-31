import { type NextRequest, NextResponse } from "next/server";
import { BookmarkService } from "@/lib/bookmark-service";
import { webhookSaveBookmarkSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url");
		const title = searchParams.get("title");
		const tags = searchParams.get("tags");

		const validationResult = webhookSaveBookmarkSchema.safeParse({
			url,
			title,
			tags,
		});
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: validationResult.error.issues },
				{ status: 400 },
			);
		}

		const {
			url: validatedUrl,
			title: validatedTitle,
			tags: validatedTags,
		} = validationResult.data;

		const bookmarkService = new BookmarkService();

		const tagArray = validatedTags
			? validatedTags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			: [];

		const bookmark = await bookmarkService.createBookmark({
			url: validatedUrl,
			title: validatedTitle,
			tags: tagArray,
		});

		return NextResponse.json({
			id: bookmark.id,
			url: bookmark.url,
			title: bookmark.title,
			message: "Bookmark saved successfully",
		});
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

		console.error("Webhook save bookmark error:", error);
		return NextResponse.json(
			{ error: "Failed to save bookmark" },
			{ status: 500 },
		);
	}
}
