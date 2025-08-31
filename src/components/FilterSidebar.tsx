"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
		onCategoryFilter("all");
		onDateRangeFilter({ start: "", end: "" });
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Filters</CardTitle>
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear all
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
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
							<div key={tag} className="flex items-center space-x-2">
								<Checkbox
									id={`tag-${tag}`}
									checked={selectedTags.includes(tag)}
									onCheckedChange={() => handleTagToggle(tag)}
								/>
								<label
									htmlFor={`tag-${tag}`}
									className="text-sm text-gray-700 capitalize cursor-pointer"
								>
									{tag}
								</label>
							</div>
						))}
					</div>
				</div>

				<Separator />

				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
					<Select
						value={selectedCategory || "all"}
						onValueChange={handleCategoryChange}
					>
						<SelectTrigger>
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							<SelectItem value="development">Development</SelectItem>
							<SelectItem value="design">Design</SelectItem>
							<SelectItem value="productivity">Productivity</SelectItem>
							<SelectItem value="learning">Learning</SelectItem>
							<SelectItem value="entertainment">Entertainment</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator />

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
							<Input
								type="date"
								aria-label="From"
								id={dateStartId}
								value={dateRange.start}
								onChange={(e) => handleDateChange("start", e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor={dateEndId}
								className="block text-xs text-gray-500 mb-1"
							>
								To
							</label>
							<Input
								type="date"
								id={dateEndId}
								aria-label="To"
								value={dateRange.end}
								onChange={(e) => handleDateChange("end", e.target.value)}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
