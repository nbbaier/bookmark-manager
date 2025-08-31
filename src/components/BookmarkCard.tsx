"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { BookmarkResponse } from "@/types/bookmark";

interface BookmarkCardProps {
	bookmark: BookmarkResponse;
	isSelected?: boolean;
	onSelect?: (id: number) => void;
}

export default function BookmarkCard({
	bookmark,
	isSelected = false,
	onSelect,
}: BookmarkCardProps) {
	const [faviconError, setFaviconError] = useState(false);

	const handleSelect = () => {
		if (onSelect) {
			onSelect(bookmark.id);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getFaviconUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
		} catch {
			return "/globe.svg";
		}
	};

	return (
		<Card
			className={`transition-all duration-200 ${
				isSelected ? "border-blue-500 ring-2 ring-blue-200" : "hover:shadow-md"
			}`}
		>
			<CardContent className="p-4">
				{onSelect && (
					<div className="flex items-center justify-end mb-2">
						<Checkbox checked={isSelected} onCheckedChange={handleSelect} />
					</div>
				)}

				<div className="flex items-start space-x-3">
					{!faviconError ? (
						<Image
							src={getFaviconUrl(bookmark.url)}
							alt="Favicon"
							width={20}
							height={20}
							className="w-5 h-5 rounded flex-shrink-0 mt-1"
							onError={() => setFaviconError(true)}
							unoptimized
						/>
					) : (
						<Image
							src="/globe.svg"
							alt="Default favicon"
							width={20}
							height={20}
							className="w-5 h-5 rounded flex-shrink-0 mt-1"
						/>
					)}

					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-medium text-gray-900 truncate">
							{bookmark.title || "Untitled"}
						</h3>
						<p className="text-xs text-gray-500 truncate mt-1">
							{bookmark.url}
						</p>

						{bookmark.notes && (
							<p className="text-xs text-gray-600 mt-2 line-clamp-2">
								{bookmark.notes}
							</p>
						)}

						<div className="flex items-center justify-between mt-3">
							<div className="flex flex-wrap gap-1">
								{bookmark.tags?.map((tag) => (
									<Badge key={tag.id} variant="secondary" className="text-xs">
										{tag.name}
									</Badge>
								))}
							</div>

							{bookmark.aiCategory && (
								<Badge variant="outline" className="text-xs">
									{bookmark.aiCategory}
								</Badge>
							)}
						</div>

						<div className="flex items-center justify-between mt-3 text-xs text-gray-400">
							<span>
								{bookmark.createdAt
									? formatDate(bookmark.createdAt)
									: "Unknown date"}
							</span>
							{bookmark.updatedAt &&
								bookmark.createdAt &&
								bookmark.updatedAt !== bookmark.createdAt && (
									<span>Updated {formatDate(bookmark.updatedAt)}</span>
								)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
