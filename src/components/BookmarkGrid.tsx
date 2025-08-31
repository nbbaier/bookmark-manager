"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import type { BookmarkResponse } from "@/types/bookmark";
import BookmarkCard from "./BookmarkCard";

interface BookmarkGridProps {
	bookmarks: BookmarkResponse[];
	viewMode: "grid" | "list";
	loading: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
}

export default function BookmarkGrid({
	bookmarks,
	viewMode,
	loading,
	hasMore,
	onLoadMore,
}: BookmarkGridProps) {
	const [selectedBookmarks, setSelectedBookmarks] = useState<Set<number>>(
		new Set(),
	);
	const selectAllId = useId();

	const handleBookmarkSelect = (id: number) => {
		const newSelected = new Set(selectedBookmarks);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedBookmarks(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedBookmarks.size === bookmarks.length) {
			setSelectedBookmarks(new Set());
		} else {
			setSelectedBookmarks(new Set(bookmarks.map((b) => b.id)));
		}
	};

	if (bookmarks.length === 0 && !loading) {
		return (
			<div className="text-center py-12">
				<div className="mx-auto w-24 h-24 text-gray-300 mb-4">
					<svg
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					No bookmarks found
				</h3>
				<p className="text-gray-500">
					{selectedBookmarks.size > 0 || selectedBookmarks.size > 0
						? "Try adjusting your filters or search terms"
						: "Start by adding your first bookmark"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{bookmarks.length > 0 && (
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id={selectAllId}
								checked={
									selectedBookmarks.size === bookmarks.length &&
									bookmarks.length > 0
								}
								onCheckedChange={handleSelectAll}
							/>
							<label
								htmlFor={selectAllId}
								className="text-sm text-gray-700 cursor-pointer"
							>
								Select all ({selectedBookmarks.size}/{bookmarks.length})
							</label>
						</div>
					</div>
				</div>
			)}

			<div
				className={`grid gap-4 ${
					viewMode === "grid"
						? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
						: "grid-cols-1"
				}`}
			>
				{bookmarks.map((bookmark) => (
					<BookmarkCard
						key={bookmark.id}
						bookmark={bookmark}
						isSelected={selectedBookmarks.has(bookmark.id)}
						onSelect={handleBookmarkSelect}
					/>
				))}
			</div>

			{loading && (
				<div className="flex justify-center py-8">
					<Spinner size="md" />
				</div>
			)}

			{hasMore && !loading && (
				<div className="flex justify-center py-6">
					<Button onClick={onLoadMore}>Load More</Button>
				</div>
			)}
		</div>
	);
}
