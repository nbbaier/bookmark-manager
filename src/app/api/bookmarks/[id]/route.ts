import { type NextRequest, NextResponse } from "next/server";
import { BookmarkService } from "@/lib/bookmark-service";
import { bookmarkIdSchema, updateBookmarkSchema } from "@/lib/validation";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const validationResult = bookmarkIdSchema.safeParse({ id });
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid bookmark ID",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const bookmarkService = new BookmarkService();
		const bookmark = await bookmarkService.getBookmark(
			validationResult.data.id,
		);

		if (!bookmark) {
			return NextResponse.json(
				{ error: "Bookmark not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(bookmark);
	} catch (error) {
		console.error("Get bookmark error:", error);
		return NextResponse.json(
			{ error: "Failed to get bookmark" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const validationResult = bookmarkIdSchema.safeParse({ id });
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid bookmark ID",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const body = await request.json();
		const updateValidationResult = updateBookmarkSchema.safeParse(body);
		if (!updateValidationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: updateValidationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const bookmarkService = new BookmarkService();
		const bookmark = await bookmarkService.updateBookmark(
			validationResult.data.id,
			updateValidationResult.data,
		);

		return NextResponse.json(bookmark);
	} catch (error) {
		if (error instanceof Error && error.message === "Bookmark not found") {
			return NextResponse.json(
				{ error: "Bookmark not found" },
				{ status: 404 },
			);
		}

		console.error("Update bookmark error:", error);
		return NextResponse.json(
			{ error: "Failed to update bookmark" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const validationResult = bookmarkIdSchema.safeParse({ id });
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid bookmark ID",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const bookmarkService = new BookmarkService();
		await bookmarkService.deleteBookmark(validationResult.data.id);

		return NextResponse.json({ message: "Bookmark deleted successfully" });
	} catch (error) {
		if (error instanceof Error && error.message === "Bookmark not found") {
			return NextResponse.json(
				{ error: "Bookmark not found" },
				{ status: 404 },
			);
		}

		console.error("Delete bookmark error:", error);
		return NextResponse.json(
			{ error: "Failed to delete bookmark" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");

		const validationResult = bookmarkIdSchema.safeParse({ id });
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Invalid bookmark ID",
					details: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const bookmarkService = new BookmarkService();

		// Handle re-categorization action
		if (action === "recategorize") {
			try {
				const bookmark = await bookmarkService.recategorizeBookmark(
					validationResult.data.id,
				);
				return NextResponse.json({
					...bookmark,
					message: "Bookmark re-categorized successfully",
				});
			} catch (error) {
				if (error instanceof Error && error.message === "Bookmark not found") {
					return NextResponse.json(
						{ error: "Bookmark not found" },
						{ status: 404 },
					);
				}
				if (
					error instanceof Error &&
					error.message === "AI service not configured"
				) {
					return NextResponse.json(
						{ error: "AI service not configured" },
						{ status: 503 },
					);
				}
				throw error;
			}
		}

		return NextResponse.json(
			{
				error:
					"Invalid or missing action parameter. Supported actions: recategorize",
			},
			{ status: 400 },
		);
	} catch (error) {
		console.error("PATCH bookmark error:", error);
		return NextResponse.json(
			{ error: "Failed to process request" },
			{ status: 500 },
		);
	}
}
