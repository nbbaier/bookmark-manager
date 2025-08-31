# AGENTS.md

## Commands

-  **Dev**: `npm run dev` (uses Turbopack)
-  **Build**: `npm run build`
-  **Lint**: `npm run lint` (Biome)
-  **Format**: `npm run format` (Biome format --write)
-  **Check**: `npm run check` (Biome check)
-  **Type check**: `npm run typecheck` (uses tsgo)
-  **DB setup**: `npm run db:setup` (generate + push schemas)
-  **DB studio**: `npm run db:studio`
-  **Seed data**: `npm run seed` (uses Bun)
-  **Test database**: `bun scripts/test-db.ts`
-  **Test AI service**: `bun scripts/test-ai-service.ts`

## Architecture

-  **Framework**: Next.js 15 with App Router + TypeScript + React 19
-  **Database**: Turso Cloud (SQLite) with Drizzle ORM + FTS5 search
-  **AI**: Vercel AI SDK for bookmark categorization
-  **UI**: shadcn/ui components with Tailwind CSS v4
-  **Runtime**: Bun for scripts and testing
-  **Structure**: `src/app/` (pages), `src/components/` (UI), `src/lib/` (services), `src/types/` (TypeScript)

## Code Style

-  **Linter**: Biome (replaces ESLint) with tab indentation and double quotes
-  **Import alias**: Use `@/` for src imports
-  **Components**: Default exports, TypeScript interfaces for props, "use client" for client components
-  **Database**: Drizzle schema in `src/lib/schema.ts`, service layer pattern in `src/lib/*-service.ts`
-  **Validation**: Zod schemas in `src/lib/validation.ts`
-  **Types**: Infer from Drizzle schema, separate request/response types in `src/types/`
-  **Styling**: Tailwind with shadcn/ui components, camelCase for props
-  **Error handling**: Try/catch with fallbacks, console.warn for non-critical errors
