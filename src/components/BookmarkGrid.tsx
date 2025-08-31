"use client";

import { useState } from "react";
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
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={
									selectedBookmarks.size === bookmarks.length &&
									bookmarks.length > 0
								}
								onChange={handleSelectAll}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<span className="ml-2 text-sm text-gray-700">
								Select all ({selectedBookmarks.size}/{bookmarks.length})
							</span>
						</label>
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
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			)}

			{hasMore && !loading && (
				<div className="flex justify-center py-6">
					<button
						type="button"
						onClick={onLoadMore}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Load More
					</button>
				</div>
			)}
		</div>
	);
}
