"use client";

import { useState } from "react";
import BookmarkGrid from "@/components/BookmarkGrid";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function DashboardPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
		start: "",
		end: "",
	});
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { bookmarks, loading, error, hasMore, loadMore } = useBookmarks({
		search: searchQuery,
		tags: selectedTags,
		category: selectedCategory === "all" ? "" : selectedCategory,
		dateRange,
	});

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const handleTagFilter = (tags: string[]) => {
		setSelectedTags(tags);
	};

	const handleCategoryFilter = (category: string) => {
		setSelectedCategory(category);
	};

	const handleDateRangeFilter = (range: { start: string; end: string }) => {
		setDateRange(range);
	};

	const handleViewToggle = () => {
		setViewMode(viewMode === "grid" ? "list" : "grid");
	};

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="max-w-7xl mx-auto">
					<Card className="border-red-200 bg-red-50">
						<CardContent className="p-4">
							<h2 className="text-red-800 font-medium">
								Error loading bookmarks
							</h2>
							<p className="text-red-600 mt-1">{error}</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">Bookmarks</h1>
					<p className="text-gray-600 mt-2">
						Organize and discover your saved links
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-6">
					<div className="lg:w-80">
						<FilterSidebar
							selectedTags={selectedTags}
							selectedCategory={selectedCategory}
							dateRange={dateRange}
							onTagFilter={handleTagFilter}
							onCategoryFilter={handleCategoryFilter}
							onDateRangeFilter={handleDateRangeFilter}
						/>
					</div>

					<div className="flex-1">
						<div className="flex items-center justify-between mb-6">
							<SearchBar onSearch={handleSearch} />
							<Button variant="outline" onClick={handleViewToggle}>
								{viewMode === "grid" ? "List View" : "Grid View"}
							</Button>
						</div>

						<BookmarkGrid
							bookmarks={bookmarks}
							viewMode={viewMode}
							loading={loading}
							hasMore={hasMore}
							onLoadMore={loadMore}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
