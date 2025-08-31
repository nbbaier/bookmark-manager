import { useCallback, useEffect, useState } from "react";
import type { BookmarkResponse } from "@/types/bookmark";

interface UseBookmarksOptions {
	search?: string;
	tags?: string[];
	category?: string;
	dateRange?: { start: string; end: string };
}

interface UseBookmarksReturn {
	bookmarks: BookmarkResponse[];
	loading: boolean;
	error: string | null;
	hasMore: boolean;
	loadMore: () => void;
}

export function useBookmarks(
	options: UseBookmarksOptions = {},
): UseBookmarksReturn {
	const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(1);

	const fetchBookmarks = useCallback(
		async (pageNum: number, reset: boolean = false) => {
			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams();
				params.append("page", pageNum.toString());
				params.append("limit", "20");

				if (options.search) {
					params.append("search", options.search);
				}

				if (options.tags && options.tags.length > 0) {
					params.append("tags", options.tags.join(","));
				}

				if (options.category) {
					params.append("category", options.category);
				}

				if (options.dateRange?.start) {
					params.append("dateFrom", options.dateRange.start);
				}

				if (options.dateRange?.end) {
					params.append("dateTo", options.dateRange.end);
				}

				const response = await fetch(`/api/bookmarks?${params.toString()}`);

				if (!response.ok) {
					throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
				}

				const data = await response.json();

				if (reset) {
					setBookmarks(data.bookmarks);
					setPage(1);
				} else {
					setBookmarks((prev) => [...prev, ...data.bookmarks]);
				}

				setHasMore(data.hasMore);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		},
		[options.search, options.tags, options.category, options.dateRange],
	);

	const loadMore = useCallback(() => {
		if (!loading && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchBookmarks(nextPage, false);
		}
	}, [loading, hasMore, page, fetchBookmarks]);

	useEffect(() => {
		setPage(1);
		fetchBookmarks(1, true);
	}, [fetchBookmarks]);

	return {
		bookmarks,
		loading,
		error,
		hasMore,
		loadMore,
	};
}
