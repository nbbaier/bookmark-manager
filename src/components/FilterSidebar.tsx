"use client";

import { useId } from "react";

interface FilterSidebarProps {
	selectedTags: string[];
	selectedCategory: string;
	dateRange: { start: string; end: string };
	onTagFilter: (tags: string[]) => void;
	onCategoryFilter: (category: string) => void;
	onDateRangeFilter: (range: { start: string; end: string }) => void;
}

export default function FilterSidebar({
	selectedTags,
	selectedCategory,
	dateRange,
	onTagFilter,
	onCategoryFilter,
	onDateRangeFilter,
}: FilterSidebarProps) {
	const dateStartId = useId();
	const dateEndId = useId();

	const handleTagToggle = (tag: string) => {
		if (selectedTags.includes(tag)) {
			onTagFilter(selectedTags.filter((t) => t !== tag));
		} else {
			onTagFilter([...selectedTags, tag]);
		}
	};

	const handleCategoryChange = (category: string) => {
		onCategoryFilter(category);
	};

	const handleDateChange = (field: "start" | "end", value: string) => {
		onDateRangeFilter({
			...dateRange,
			[field]: value,
		});
	};

	const clearFilters = () => {
		onTagFilter([]);
		onCategoryFilter("");
		onDateRangeFilter({ start: "", end: "" });
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-medium text-gray-900">Filters</h3>
				<button
					type="button"
					onClick={clearFilters}
					className="text-sm text-blue-600 hover:text-blue-800"
				>
					Clear all
				</button>
			</div>

			<div className="space-y-6">
				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
					<div className="space-y-2">
						{[
							"javascript",
							"react",
							"typescript",
							"web",
							"design",
							"productivity",
						].map((tag) => (
							<label key={tag} className="flex items-center">
								<input
									type="checkbox"
									checked={selectedTags.includes(tag)}
									onChange={() => handleTagToggle(tag)}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<span className="ml-2 text-sm text-gray-700 capitalize">
									{tag}
								</span>
							</label>
						))}
					</div>
				</div>

				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
					<select
						value={selectedCategory}
						onChange={(e) => handleCategoryChange(e.target.value)}
						className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">All categories</option>
						<option value="development">Development</option>
						<option value="design">Design</option>
						<option value="productivity">Productivity</option>
						<option value="learning">Learning</option>
						<option value="entertainment">Entertainment</option>
					</select>
				</div>

				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-3">Date Range</h4>
					<div className="space-y-3">
						<div>
							<label
								htmlFor={dateStartId}
								className="block text-xs text-gray-500 mb-1"
							>
								From
							</label>
							<input
								type="date"
								aria-label="From"
								id={dateStartId}
								value={dateRange.start}
								onChange={(e) => handleDateChange("start", e.target.value)}
								className="block w-full px-3  py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div>
							<label
								htmlFor={dateEndId}
								className="block text-xs text-gray-500 mb-1"
							>
								To
							</label>
							<input
								type="date"
								id={dateEndId}
								aria-label="To"
								value={dateRange.end}
								onChange={(e) => handleDateChange("end", e.target.value)}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
