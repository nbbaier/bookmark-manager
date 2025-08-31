# Bookmark Organizer

AI-powered personal bookmark organization system built with Next.js, TypeScript, and Turso Cloud.

## Features

-  🚀 **Quick Import** - Bulk import from browser bookmark exports
-  🤖 **AI Categorization** - Automatic bookmark organization using AI
-  🔍 **Smart Search** - Full-text and semantic search capabilities
-  🏷️ **Tag Management** - Flexible tagging system for organization
-  📱 **Responsive Design** - Works on desktop and mobile devices
-  🔄 **Offline Support** - View bookmarks even when offline

## Tech Stack

-  **Frontend**: Next.js 14+ with TypeScript and React
-  **Database**: Turso Cloud (SQLite) with FTS5 full-text search
-  **AI Integration**: Vercel AI SDK for automatic categorization
-  **Styling**: Tailwind CSS for responsive design
-  **Hosting**: Vercel platform

## Getting Started

### Prerequisites

-  Node.js 18+
-  npm or yarn
-  Turso Cloud account (for production database)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd bookmark-manager
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=your_turso_database_url_here
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Next.js Configuration
NEXT_PUBLIC_APP_NAME=Bookmark Organizer
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a Turso Cloud account at [turso.tech](https://turso.tech)
2. Create a new database for your bookmarks
3. Get your database URL and auth token
4. Update your `.env.local` file with the credentials

### Health Check

Test your setup by visiting `/api/health` endpoint. You should see:

```json
{
   "status": "healthy",
   "database": "connected",
   "message": "Bookmark Organizer is running successfully"
}
```

## Development

### Available Scripts

-  `npm run dev` - Start development server
-  `npm run build` - Build for production
-  `npm run start` - Start production server
-  `npm run lint` - Run ESLint
-  `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── import/            # Import page
│   └── layout.tsx         # Root layout
├── components/             # React components
├── lib/                   # Utility libraries
│   └── db.ts             # Database connection
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## API Endpoints

-  `GET /api/health` - Health check endpoint
-  `GET /api/webhook/save-bookmark` - Save bookmark via webhook
-  `GET /api/bookmarks` - List bookmarks with pagination
-  `POST /api/bookmarks` - Create new bookmark
-  `PUT /api/bookmarks/[id]` - Update bookmark
-  `DELETE /api/bookmarks/[id]` - Delete bookmark

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.
