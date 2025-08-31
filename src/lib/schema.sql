-- Bookmarks table for storing bookmark data
CREATE TABLE IF NOT EXISTS
   bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      favicon_url TEXT,
      ai_category TEXT DEFAULT 'Uncategorized',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

-- Tags table for organizing bookmarks
CREATE TABLE IF NOT EXISTS
   tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

-- Junction table for many-to-many relationship between bookmarks and tags
CREATE TABLE IF NOT EXISTS
   bookmark_tags (
      bookmark_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (bookmark_id, tag_id),
      FOREIGN KEY (bookmark_id) REFERENCES bookmarks (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
   );

-- Full-text search virtual table using FTS5
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5 (
   title,
   description,
   content = 'bookmarks',
   content_rowid = 'id'
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks (url);

CREATE INDEX IF NOT EXISTS idx_bookmarks_ai_category ON bookmarks (ai_category);

CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks (created_at);

CREATE INDEX IF NOT EXISTS idx_bookmarks_updated_at ON bookmarks (updated_at);

CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags (bookmark_id);

CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags (tag_id);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

-- Trigger to update the FTS index when bookmarks are inserted
CREATE TRIGGER IF NOT EXISTS bookmarks_ai_insert AFTER INSERT ON bookmarks BEGIN
INSERT INTO
   bookmarks_fts (rowid, title, description)
VALUES
   (new.id, new.title, new.description);

END;

-- Trigger to update the FTS index when bookmarks are updated
CREATE TRIGGER IF NOT EXISTS bookmarks_ai_update AFTER
UPDATE ON bookmarks BEGIN
INSERT INTO
   bookmarks_fts (bookmarks_fts, rowid, title, description)
VALUES
   ('delete', old.id, old.title, old.description);

INSERT INTO
   bookmarks_fts (rowid, title, description)
VALUES
   (new.id, new.title, new.description);

END;

-- Trigger to update the FTS index when bookmarks are deleted
CREATE TRIGGER IF NOT EXISTS bookmarks_ai_delete AFTER DELETE ON bookmarks BEGIN
INSERT INTO
   bookmarks_fts (bookmarks_fts, rowid, title, description)
VALUES
   ('delete', old.id, old.title, old.description);

END;

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_bookmarks_updated_at AFTER
UPDATE ON bookmarks BEGIN
UPDATE bookmarks
SET
   updated_at = CURRENT_TIMESTAMP
WHERE
   id = new.id;

END;