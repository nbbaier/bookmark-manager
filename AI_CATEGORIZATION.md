# AI Categorization Configuration

This document explains the AI categorization functionality and its configurable parameters.

## Overview

The bookmark manager includes AI-powered automatic categorization of bookmarks. To prevent overwhelming AI services with too many concurrent requests and to respect API rate limits, the system processes bookmarks in configurable batches.

## Configuration

### MAX_CONCURRENT_CATEGORIZATIONS

The `MAX_CONCURRENT_CATEGORIZATIONS` constant controls how many bookmarks are processed concurrently for AI categorization.

**Default Value:** `3`

**Environment Variable:** `MAX_CONCURRENT_CATEGORIZATIONS`

**Example:**
```bash
# Set batch size to 2 for more conservative processing
MAX_CONCURRENT_CATEGORIZATIONS=2 npm start

# Set batch size to 5 for faster processing (if your AI service can handle it)
MAX_CONCURRENT_CATEGORIZATIONS=5 npm start
```

### AI_CATEGORIZATION_TIMEOUT

Controls the timeout for AI categorization requests.

**Default Value:** `30000` (30 seconds)

**Environment Variable:** `AI_CATEGORIZATION_TIMEOUT`

## Usage

### Automatic Categorization

The `BookmarkService` provides methods for AI categorization:

```typescript
import { BookmarkService } from '@/lib/bookmark-service';

const bookmarkService = new BookmarkService();

// Categorize only uncategorized bookmarks
await bookmarkService.categorizeUncategorizedBookmarks();

// Re-categorize all bookmarks
await bookmarkService.recategorizeAllBookmarks();
```

### Testing

Test the AI categorization functionality:

```bash
npm run test-ai
```

Test with different batch sizes:

```bash
MAX_CONCURRENT_CATEGORIZATIONS=2 npm run test-ai
```

## Implementation Details

- Bookmarks are processed in batches to prevent API rate limiting
- The batch size was previously hardcoded as a magic number `3`
- Now it's configurable through the `MAX_CONCURRENT_CATEGORIZATIONS` constant
- The AI service handles batching internally using `Promise.all()` with sliced arrays
- Each batch is processed concurrently, but batches are processed sequentially

## Example Output

```
🤖 Testing AI Categorization with batch processing
📊 Batch size (MAX_CONCURRENT_CATEGORIZATIONS): 3

📚 Total bookmarks in database: 5
🔍 Uncategorized bookmarks: 5

🏃 Running AI categorization...
Processing 5 uncategorized bookmarks in batches of 3
Successfully categorized 5 bookmarks

📋 Categorization results:
   1. React Tutorial - Learn React
      Category: Development

   2. JavaScript - MDN Web Docs  
      Category: Development
```

## Future Enhancements

- Integration with real AI services (OpenAI, Anthropic, etc.)
- Confidence scoring and manual review for low-confidence categorizations
- Custom categories and category learning
- Bulk categorization APIs