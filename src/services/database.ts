// SQLite database service for local storage

import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Task, List, Tag, Priority } from '../types';

const DB_NAME = 'tickit.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync(DB_NAME);
  
  await db.execAsync(`
    -- Lists table
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL DEFAULT '📋',
      color TEXT,
      is_inbox INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Tags table
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      completed INTEGER NOT NULL DEFAULT 0,
      list_id TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (list_id) REFERENCES lists(id)
    );

    -- Task-Tag junction table
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    -- Sync tombstones
    CREATE TABLE IF NOT EXISTS sync_tombstones (
      id TEXT PRIMARY KEY,
      record_type TEXT NOT NULL,
      deleted_at TEXT NOT NULL
    );

    -- Sync state
    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_tasks_list ON tasks(list_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tombstones_deleted ON sync_tombstones(deleted_at);
  `);

  // Ensure inbox exists
  await ensureInbox();
}

async function ensureInbox(): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM lists WHERE is_inbox = 1'
  );
  
  if (!result || result.count === 0) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO lists (id, name, description, icon, color, is_inbox, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'Inbox', 'Default inbox for tasks', '📥', null, 1, 0, now, now]
    );
  }
}

// ==================== Tasks ====================

export async function getTasks(listId?: string, includeCompleted = false): Promise<Task[]> {
  if (!db) throw new Error('Database not initialized');
  
  let query = 'SELECT * FROM tasks';
  const params: any[] = [];
  const conditions: string[] = [];
  
  if (listId) {
    conditions.push('list_id = ?');
    params.push(listId);
  }
  
  if (!includeCompleted) {
    conditions.push('completed = 0');
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY completed ASC, priority DESC, due_date ASC NULLS LAST, created_at DESC';
  
  const rows = await db.getAllAsync<Task>(query, params);
  return rows.map(row => ({
    ...row,
    completed: Boolean(row.completed),
  }));
}

export async function getAllTasks(): Promise<Task[]> {
  if (!db) throw new Error('Database not initialized');
  const rows = await db.getAllAsync<Task>('SELECT * FROM tasks');
  return rows.map(row => ({
    ...row,
    completed: Boolean(row.completed),
  }));
}

export async function getTask(id: string): Promise<Task | null> {
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!row) return null;
  return { ...row, completed: Boolean(row.completed) };
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  const id = uuidv4();
  
  await db.runAsync(
    `INSERT INTO tasks (id, title, description, url, priority, completed, list_id, due_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, now, now]
  );
  
  return { ...task, id, created_at: now, updated_at: now };
}

export async function updateTask(task: Task): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  
  await db.runAsync(
    `UPDATE tasks SET title = ?, description = ?, url = ?, priority = ?, completed = ?, list_id = ?, due_date = ?, updated_at = ?
     WHERE id = ?`,
    [task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, now, task.id]
  );
}

export async function deleteTask(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_tombstones (id, record_type, deleted_at) VALUES (?, ?, ?)',
    [id, 'task', now]
  );
}

export async function toggleTaskComplete(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE tasks SET completed = NOT completed, updated_at = ? WHERE id = ?',
    [now, id]
  );
}

// ==================== Lists ====================

export async function getLists(): Promise<List[]> {
  if (!db) throw new Error('Database not initialized');
  const rows = await db.getAllAsync<List>('SELECT * FROM lists ORDER BY sort_order, name');
  return rows.map(row => ({
    ...row,
    is_inbox: Boolean(row.is_inbox),
  }));
}

export async function getInbox(): Promise<List> {
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync<List>('SELECT * FROM lists WHERE is_inbox = 1');
  if (!row) throw new Error('Inbox not found');
  return { ...row, is_inbox: true };
}

export async function createList(list: Omit<List, 'id' | 'is_inbox' | 'created_at' | 'updated_at'>): Promise<List> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  const id = uuidv4();
  
  await db.runAsync(
    `INSERT INTO lists (id, name, description, icon, color, is_inbox, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, list.name, list.description, list.icon, list.color, 0, list.sort_order, now, now]
  );
  
  return { ...list, id, is_inbox: false, created_at: now, updated_at: now };
}

export async function updateList(list: List): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  
  await db.runAsync(
    `UPDATE lists SET name = ?, description = ?, icon = ?, color = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [list.name, list.description, list.icon, list.color, list.sort_order, now, list.id]
  );
}

export async function deleteList(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  // Move tasks to inbox first
  const inbox = await getInbox();
  const now = new Date().toISOString();
  
  await db.runAsync('UPDATE tasks SET list_id = ?, updated_at = ? WHERE list_id = ?', [inbox.id, now, id]);
  await db.runAsync('DELETE FROM lists WHERE id = ? AND is_inbox = 0', [id]);
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_tombstones (id, record_type, deleted_at) VALUES (?, ?, ?)',
    [id, 'list', now]
  );
}

// ==================== Tags ====================

export async function getTags(): Promise<Tag[]> {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync<Tag>('SELECT * FROM tags ORDER BY name');
}

export async function createTag(tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  const id = uuidv4();
  
  await db.runAsync(
    'INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, tag.name, tag.color, now, now]
  );
  
  return { ...tag, id, created_at: now, updated_at: now };
}

export async function updateTag(tag: Tag): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  
  await db.runAsync(
    'UPDATE tags SET name = ?, color = ?, updated_at = ? WHERE id = ?',
    [tag.name, tag.color, now, tag.id]
  );
}

export async function deleteTag(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const now = new Date().toISOString();
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_tombstones (id, record_type, deleted_at) VALUES (?, ?, ?)',
    [id, 'tag', now]
  );
}

// ==================== Task Tags ====================

export async function getTaskTags(taskId: string): Promise<Tag[]> {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync<Tag>(
    `SELECT t.* FROM tags t
     INNER JOIN task_tags tt ON t.id = tt.tag_id
     WHERE tt.task_id = ?
     ORDER BY t.name`,
    [taskId]
  );
}

export async function setTaskTags(taskId: string, tagIds: string[]): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync('DELETE FROM task_tags WHERE task_id = ?', [taskId]);
  
  for (const tagId of tagIds) {
    await db.runAsync(
      'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
      [taskId, tagId]
    );
  }
}

// ==================== Sync ====================

export async function getLastSync(): Promise<string | null> {
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM sync_state WHERE key = ?', ['last_sync']);
  return row?.value ?? null;
}

export async function setLastSync(timestamp: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)',
    ['last_sync', timestamp]
  );
}

export async function getTasksSince(since: string): Promise<Task[]> {
  if (!db) throw new Error('Database not initialized');
  const rows = await db.getAllAsync<Task>('SELECT * FROM tasks WHERE updated_at > ?', [since]);
  return rows.map(row => ({ ...row, completed: Boolean(row.completed) }));
}

export async function getListsSince(since: string): Promise<List[]> {
  if (!db) throw new Error('Database not initialized');
  const rows = await db.getAllAsync<List>('SELECT * FROM lists WHERE updated_at > ?', [since]);
  return rows.map(row => ({ ...row, is_inbox: Boolean(row.is_inbox) }));
}

export async function getTagsSince(since: string): Promise<Tag[]> {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync<Tag>('SELECT * FROM tags WHERE updated_at > ?', [since]);
}

export async function getTombstonesSince(since: string): Promise<Array<{ id: string; record_type: string; deleted_at: string }>> {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync('SELECT id, record_type, deleted_at FROM sync_tombstones WHERE deleted_at > ?', [since]);
}

// Upsert methods for sync
export async function upsertTask(task: Task): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const existing = await db.getFirstAsync<{ updated_at: string }>('SELECT updated_at FROM tasks WHERE id = ?', [task.id]);
  
  if (existing) {
    if (task.updated_at > existing.updated_at) {
      await db.runAsync(
        `UPDATE tasks SET title = ?, description = ?, url = ?, priority = ?, completed = ?, list_id = ?, due_date = ?, updated_at = ?
         WHERE id = ?`,
        [task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, task.updated_at, task.id]
      );
    }
  } else {
    await db.runAsync(
      `INSERT INTO tasks (id, title, description, url, priority, completed, list_id, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.id, task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, task.created_at, task.updated_at]
    );
  }
}

export async function upsertList(list: List): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync(
    `INSERT OR REPLACE INTO lists (id, name, description, icon, color, is_inbox, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [list.id, list.name, list.description, list.icon, list.color, list.is_inbox ? 1 : 0, list.sort_order, list.created_at, list.updated_at]
  );
}

export async function upsertTag(tag: Tag): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync(
    `INSERT OR REPLACE INTO tags (id, name, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [tag.id, tag.name, tag.color, tag.created_at, tag.updated_at]
  );
}

export async function deleteTaskById(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function deleteListById(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM lists WHERE id = ? AND is_inbox = 0', [id]);
}

export async function deleteTagById(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
}
