import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Bookmark Organizer",
	description: "AI-powered personal bookmark organization system",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<header className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center py-4">
							<h1 className="text-2xl font-bold text-gray-900">
								Bookmark Organizer
							</h1>
							<nav className="flex space-x-4">
								<Link href="/" className="text-gray-600 hover:text-gray-900">
									Dashboard
								</Link>
								<a href="/import" className="text-gray-600 hover:text-gray-900">
									Import
								</a>
							</nav>
						</div>
					</div>
				</header>
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{children}
				</main>
			</body>
		</html>
	);
}
