"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
	onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
	const [searchValue, setSearchValue] = useState("");
	const debouncedSearchValue = useDebounce(searchValue, 300);

	useEffect(() => {
		onSearch(debouncedSearchValue);
	}, [debouncedSearchValue, onSearch]);

	return (
		<div className="relative flex-1 max-w-md">
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
				<svg
					className="h-5 w-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			<Input
				type="text"
				value={searchValue}
				onChange={(e) => setSearchValue(e.target.value)}
				placeholder="Search bookmarks..."
				className="pl-10"
			/>
		</div>
	);
}
