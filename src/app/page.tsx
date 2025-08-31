import Image from "next/image";

export default function Home() {
	return (
		<div className="text-center">
			<h1 className="text-4xl font-bold text-gray-900 mb-6">
				Welcome to Bookmark Organizer
			</h1>
			<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
				Organize your bookmarks with AI-powered categorization, advanced search,
				and smart tagging. Import from your browser and let AI help you stay
				organized.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
				<div className="bg-white p-6 rounded-lg shadow-md border">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						🚀 Quick Start
					</h2>
					<p className="text-gray-600 mb-4">
						Get started by importing your existing bookmarks or adding new ones
						manually.
					</p>
					<a
						href="/import"
						className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
					>
						Import Bookmarks
					</a>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-md border">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						🔍 Smart Search
					</h2>
					<p className="text-gray-600 mb-4">
						Find bookmarks instantly with AI-powered semantic search and
						full-text indexing.
					</p>
					<a
						href="/dashboard"
						className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
					>
						View Dashboard
					</a>
				</div>
			</div>

			<div className="mt-12 text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
				<div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
					<span className="bg-gray-100 px-3 py-1 rounded-full">
						AI Categorization
					</span>
					<span className="bg-gray-100 px-3 py-1 rounded-full">
						Smart Search
					</span>
					<span className="bg-gray-100 px-3 py-1 rounded-full">
						Tag Management
					</span>
					<span className="bg-gray-100 px-3 py-1 rounded-full">
						Bulk Import
					</span>
					<span className="bg-gray-100 px-3 py-1 rounded-full">
						Offline Access
					</span>
				</div>
			</div>
		</div>
	);
}
