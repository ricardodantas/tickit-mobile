// SQLite database service for local storage
// Uses expo-sqlite on native, in-memory store on web

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { Task, List, Tag } from '../types';

// Generate UUID using expo-crypto
function uuidv4(): string {
  return Crypto.randomUUID();
}

// ==================== Platform Detection ====================
const isWeb = Platform.OS === 'web';

// ==================== In-Memory Store for Web ====================
let memoryStore = {
  tasks: [] as Task[],
  lists: [] as List[],
  tags: [] as Tag[],
  tombstones: [] as Array<{ id: string; record_type: string; deleted_at: string }>,
  syncState: {} as Record<string, string>,
};

// ==================== SQLite for Native ====================
let db: any = null;

async function getDb() {
  if (isWeb) return null;
  if (!db) {
    const SQLite = await import('expo-sqlite');
    db = await SQLite.openDatabaseAsync('tickit.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  if (isWeb) {
    // Initialize with default inbox for web
    if (memoryStore.lists.length === 0) {
      const now = new Date().toISOString();
      memoryStore.lists.push({
        id: uuidv4(),
        name: 'Inbox',
        description: 'Default inbox for tasks',
        icon: '📥',
        color: null,
        is_inbox: true,
        sort_order: 0,
        created_at: now,
        updated_at: now,
      });
      // Add sample data for demo
      memoryStore.lists.push({
        id: uuidv4(),
        name: 'Work',
        description: 'Work-related tasks',
        icon: '💼',
        color: '#bd93f9',
        is_inbox: false,
        sort_order: 1,
        created_at: now,
        updated_at: now,
      });
      memoryStore.lists.push({
        id: uuidv4(),
        name: 'Personal',
        description: 'Personal tasks',
        icon: '🏠',
        color: '#50fa7b',
        is_inbox: false,
        sort_order: 2,
        created_at: now,
        updated_at: now,
      });
      
      // Add sample tags
      memoryStore.tags = [
        { id: uuidv4(), name: 'urgent', color: '#ff5555', created_at: now, updated_at: now },
        { id: uuidv4(), name: 'bug', color: '#ff79c6', created_at: now, updated_at: now },
        { id: uuidv4(), name: 'feature', color: '#8be9fd', created_at: now, updated_at: now },
      ];
      
      // Add sample tasks
      const inbox = memoryStore.lists[0];
      const work = memoryStore.lists[1];
      memoryStore.tasks = [
        {
          id: uuidv4(),
          title: 'Review pull request',
          description: 'Check the new feature implementation',
          url: 'https://github.com',
          priority: 'high',
          completed: false,
          list_id: work.id,
          due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          created_at: now,
          updated_at: now,
        },
        {
          id: uuidv4(),
          title: 'Update documentation',
          description: null,
          url: null,
          priority: 'medium',
          completed: false,
          list_id: work.id,
          due_date: null,
          created_at: now,
          updated_at: now,
        },
        {
          id: uuidv4(),
          title: 'Buy groceries',
          description: 'Milk, eggs, bread',
          url: null,
          priority: 'low',
          completed: false,
          list_id: inbox.id,
          due_date: new Date().toISOString().split('T')[0],
          created_at: now,
          updated_at: now,
        },
        {
          id: uuidv4(),
          title: 'Fix critical bug',
          description: 'Production issue',
          url: null,
          priority: 'urgent',
          completed: false,
          list_id: work.id,
          due_date: null,
          created_at: now,
          updated_at: now,
        },
        {
          id: uuidv4(),
          title: 'Completed task example',
          description: null,
          url: null,
          priority: 'medium',
          completed: true,
          list_id: inbox.id,
          due_date: null,
          created_at: now,
          updated_at: now,
        },
      ];
    }
    return;
  }

  const database = await getDb();
  if (!database) return;
  
  await database.execAsync(`
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

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_tombstones (
      id TEXT PRIMARY KEY,
      record_type TEXT NOT NULL,
      deleted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_list ON tasks(list_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tombstones_deleted ON sync_tombstones(deleted_at);
  `);

  await ensureInbox();
}

async function ensureInbox(): Promise<void> {
  if (isWeb) return;
  
  const database = await getDb();
  if (!database) return;
  
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM lists WHERE is_inbox = 1'
  );
  
  if (!result || result.count === 0) {
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT INTO lists (id, name, description, icon, color, is_inbox, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'Inbox', 'Default inbox for tasks', '📥', null, 1, 0, now, now]
    );
  }
}

// ==================== Tasks ====================

export async function getTasks(listId?: string, includeCompleted = false): Promise<Task[]> {
  if (isWeb) {
    let tasks = [...memoryStore.tasks];
    if (listId) {
      tasks = tasks.filter(t => t.list_id === listId);
    }
    if (!includeCompleted) {
      tasks = tasks.filter(t => !t.completed);
    }
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }
  
  const database = await getDb();
  if (!database) return [];
  
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
  
  const rows = await database.getAllAsync<Task>(query, params);
  return rows.map(row => ({ ...row, completed: Boolean(row.completed) }));
}

export async function getAllTasks(): Promise<Task[]> {
  if (isWeb) return [...memoryStore.tasks];
  
  const database = await getDb();
  if (!database) return [];
  
  const rows = await database.getAllAsync<Task>('SELECT * FROM tasks');
  return rows.map(row => ({ ...row, completed: Boolean(row.completed) }));
}

export async function getTask(id: string): Promise<Task | null> {
  if (isWeb) {
    return memoryStore.tasks.find(t => t.id === id) || null;
  }
  
  const database = await getDb();
  if (!database) return null;
  
  const row = await database.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
  if (!row) return null;
  return { ...row, completed: Boolean(row.completed) };
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const now = new Date().toISOString();
  const id = uuidv4();
  const newTask = { ...task, id, created_at: now, updated_at: now };
  
  if (isWeb) {
    memoryStore.tasks.push(newTask);
    return newTask;
  }
  
  const database = await getDb();
  if (!database) return newTask;
  
  await database.runAsync(
    `INSERT INTO tasks (id, title, description, url, priority, completed, list_id, due_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, now, now]
  );
  
  return newTask;
}

export async function updateTask(task: Task): Promise<void> {
  const now = new Date().toISOString();
  
  if (isWeb) {
    const idx = memoryStore.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      memoryStore.tasks[idx] = { ...task, updated_at: now };
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    `UPDATE tasks SET title = ?, description = ?, url = ?, priority = ?, completed = ?, list_id = ?, due_date = ?, updated_at = ?
     WHERE id = ?`,
    [task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, now, task.id]
  );
}

export async function deleteTask(id: string): Promise<void> {
  const now = new Date().toISOString();
  
  if (isWeb) {
    memoryStore.tasks = memoryStore.tasks.filter(t => t.id !== id);
    memoryStore.tombstones.push({ id, record_type: 'task', deleted_at: now });
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  await database.runAsync(
    'INSERT OR REPLACE INTO sync_tombstones (id, record_type, deleted_at) VALUES (?, ?, ?)',
    [id, 'task', now]
  );
}

export async function toggleTaskComplete(id: string): Promise<void> {
  const now = new Date().toISOString();
  
  if (isWeb) {
    const task = memoryStore.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.updated_at = now;
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    'UPDATE tasks SET completed = NOT completed, updated_at = ? WHERE id = ?',
    [now, id]
  );
}

// ==================== Lists ====================

export async function getLists(): Promise<List[]> {
  if (isWeb) {
    return [...memoryStore.lists].sort((a, b) => a.sort_order - b.sort_order);
  }
  
  const database = await getDb();
  if (!database) return [];
  
  const rows = await database.getAllAsync<List>('SELECT * FROM lists ORDER BY sort_order, name');
  return rows.map(row => ({ ...row, is_inbox: Boolean(row.is_inbox) }));
}

export async function getInbox(): Promise<List> {
  if (isWeb) {
    const inbox = memoryStore.lists.find(l => l.is_inbox);
    if (!inbox) throw new Error('Inbox not found');
    return inbox;
  }
  
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  const row = await database.getFirstAsync<List>('SELECT * FROM lists WHERE is_inbox = 1');
  if (!row) throw new Error('Inbox not found');
  return { ...row, is_inbox: true };
}

export async function createList(list: Omit<List, 'id' | 'is_inbox' | 'created_at' | 'updated_at'>): Promise<List> {
  const now = new Date().toISOString();
  const id = uuidv4();
  const newList = { ...list, id, is_inbox: false, created_at: now, updated_at: now };
  
  if (isWeb) {
    memoryStore.lists.push(newList);
    return newList;
  }
  
  const database = await getDb();
  if (!database) return newList;
  
  await database.runAsync(
    `INSERT INTO lists (id, name, description, icon, color, is_inbox, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, list.name, list.description, list.icon, list.color, 0, list.sort_order, now, now]
  );
  
  return newList;
}

export async function updateList(list: List): Promise<void> {
  const now = new Date().toISOString();
  
  if (isWeb) {
    const idx = memoryStore.lists.findIndex(l => l.id === list.id);
    if (idx !== -1) {
      memoryStore.lists[idx] = { ...list, updated_at: now };
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    `UPDATE lists SET name = ?, description = ?, icon = ?, color = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [list.name, list.description, list.icon, list.color, list.sort_order, now, list.id]
  );
}

export async function deleteList(id: string): Promise<void> {
  const inbox = await getInbox();
  const now = new Date().toISOString();
  
  if (isWeb) {
    memoryStore.tasks.forEach(t => {
      if (t.list_id === id) {
        t.list_id = inbox.id;
        t.updated_at = now;
      }
    });
    memoryStore.lists = memoryStore.lists.filter(l => l.id !== id || l.is_inbox);
    memoryStore.tombstones.push({ id, record_type: 'list', deleted_at: now });
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('UPDATE tasks SET list_id = ?, updated_at = ? WHERE list_id = ?', [inbox.id, now, id]);
  await database.runAsync('DELETE FROM lists WHERE id = ? AND is_inbox = 0', [id]);
  await database.runAsync(
    'INSERT OR REPLACE INTO sync_tombstones (id, record_type, deleted_at) VALUES (?, ?, ?)',
    [id, 'list', now]
  );
}

// ==================== Tags ====================

export async function getTags(): Promise<Tag[]> {
  if (isWeb) {
    return [...memoryStore.tags].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  const database = await getDb();
  if (!database) return [];
  
  return await database.getAllAsync<Tag>('SELECT * FROM tags ORDER BY name');
}

export async function createTag(tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> {
  const now = new Date().toISOString();
  const id = uuidv4();
  const newTag = { ...tag, id, created_at: now, updated_at: now };
  
  if (isWeb) {
    memoryStore.tags.push(newTag);
    return newTag;
  }
  
  const database = await getDb();
  if (!database) return newTag;
  
  await database.runAsync(
    'INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, tag.name, tag.color, now, now]
  );
  
  return newTag;
}

export async function updateTag(tag: Tag): Promise<void> {
  const now = new Date().toISOString();
  
  if (isWeb) {
    const idx = memoryStore.tags.findIndex(t => t.id === tag.id);
    if (idx !== -1) {
      memoryStore.tags[idx] = { ...tag, updated_at: now };
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    'UPDATE tags SET name = ?, color = ?, updated_at = ? WHERE id = ?',
    [tag.name, tag.color, now, tag.id]
  );
}

export async function deleteTag(id: string): Promise<void> {
  const now = new Date().toISOString();
  
  if (isWeb) {
    memoryStore.tags = memoryStore.tags.filter(t => t.id !== id);
    memoryStore.tombstones.push({ id, record_type: 'tag', deleted_at: now });
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('DELETE FROM tags WHERE id = ?', [id]);
  await database.runAsync(
    'INSERT OR REPLACE INTO sync_tombstones (id, record_type, deleted_at) VALUES (?, ?, ?)',
    [id, 'tag', now]
  );
}

// ==================== Task Tags ====================

export async function getTaskTags(taskId: string): Promise<Tag[]> {
  if (isWeb) {
    // For web demo, return empty (no junction table in memory)
    return [];
  }
  
  const database = await getDb();
  if (!database) return [];
  
  return await database.getAllAsync<Tag>(
    `SELECT t.* FROM tags t
     INNER JOIN task_tags tt ON t.id = tt.tag_id
     WHERE tt.task_id = ?
     ORDER BY t.name`,
    [taskId]
  );
}

export async function setTaskTags(taskId: string, tagIds: string[]): Promise<void> {
  if (isWeb) {
    // No-op for web demo
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('DELETE FROM task_tags WHERE task_id = ?', [taskId]);
  
  for (const tagId of tagIds) {
    await database.runAsync(
      'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
      [taskId, tagId]
    );
  }
}

// ==================== Sync ====================

export async function getLastSync(): Promise<string | null> {
  if (isWeb) {
    return memoryStore.syncState['last_sync'] || null;
  }
  
  const database = await getDb();
  if (!database) return null;
  
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM sync_state WHERE key = ?', ['last_sync']);
  return row?.value ?? null;
}

export async function setLastSync(timestamp: string): Promise<void> {
  if (isWeb) {
    memoryStore.syncState['last_sync'] = timestamp;
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    'INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)',
    ['last_sync', timestamp]
  );
}

export async function getTasksSince(since: string): Promise<Task[]> {
  if (isWeb) {
    return memoryStore.tasks.filter(t => t.updated_at > since);
  }
  
  const database = await getDb();
  if (!database) return [];
  
  const rows = await database.getAllAsync<Task>('SELECT * FROM tasks WHERE updated_at > ?', [since]);
  return rows.map(row => ({ ...row, completed: Boolean(row.completed) }));
}

export async function getListsSince(since: string): Promise<List[]> {
  if (isWeb) {
    return memoryStore.lists.filter(l => l.updated_at > since);
  }
  
  const database = await getDb();
  if (!database) return [];
  
  const rows = await database.getAllAsync<List>('SELECT * FROM lists WHERE updated_at > ?', [since]);
  return rows.map(row => ({ ...row, is_inbox: Boolean(row.is_inbox) }));
}

export async function getTagsSince(since: string): Promise<Tag[]> {
  if (isWeb) {
    return memoryStore.tags.filter(t => t.updated_at > since);
  }
  
  const database = await getDb();
  if (!database) return [];
  
  return await database.getAllAsync<Tag>('SELECT * FROM tags WHERE updated_at > ?', [since]);
}

export async function getTombstonesSince(since: string): Promise<Array<{ id: string; record_type: string; deleted_at: string }>> {
  if (isWeb) {
    return memoryStore.tombstones.filter(t => t.deleted_at > since);
  }
  
  const database = await getDb();
  if (!database) return [];
  
  return await database.getAllAsync('SELECT id, record_type, deleted_at FROM sync_tombstones WHERE deleted_at > ?', [since]);
}

// Upsert methods for sync
export async function upsertTask(task: Task): Promise<void> {
  if (isWeb) {
    const idx = memoryStore.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      if (task.updated_at > memoryStore.tasks[idx].updated_at) {
        memoryStore.tasks[idx] = task;
      }
    } else {
      memoryStore.tasks.push(task);
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  const existing = await database.getFirstAsync<{ updated_at: string }>('SELECT updated_at FROM tasks WHERE id = ?', [task.id]);
  
  if (existing) {
    if (task.updated_at > existing.updated_at) {
      await database.runAsync(
        `UPDATE tasks SET title = ?, description = ?, url = ?, priority = ?, completed = ?, list_id = ?, due_date = ?, updated_at = ?
         WHERE id = ?`,
        [task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, task.updated_at, task.id]
      );
    }
  } else {
    await database.runAsync(
      `INSERT INTO tasks (id, title, description, url, priority, completed, list_id, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.id, task.title, task.description, task.url, task.priority, task.completed ? 1 : 0, task.list_id, task.due_date, task.created_at, task.updated_at]
    );
  }
}

export async function upsertList(list: List): Promise<void> {
  if (isWeb) {
    const idx = memoryStore.lists.findIndex(l => l.id === list.id);
    if (idx !== -1) {
      memoryStore.lists[idx] = list;
    } else {
      memoryStore.lists.push(list);
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    `INSERT OR REPLACE INTO lists (id, name, description, icon, color, is_inbox, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [list.id, list.name, list.description, list.icon, list.color, list.is_inbox ? 1 : 0, list.sort_order, list.created_at, list.updated_at]
  );
}

export async function upsertTag(tag: Tag): Promise<void> {
  if (isWeb) {
    const idx = memoryStore.tags.findIndex(t => t.id === tag.id);
    if (idx !== -1) {
      memoryStore.tags[idx] = tag;
    } else {
      memoryStore.tags.push(tag);
    }
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync(
    `INSERT OR REPLACE INTO tags (id, name, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [tag.id, tag.name, tag.color, tag.created_at, tag.updated_at]
  );
}

export async function deleteTaskById(id: string): Promise<void> {
  if (isWeb) {
    memoryStore.tasks = memoryStore.tasks.filter(t => t.id !== id);
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function deleteListById(id: string): Promise<void> {
  if (isWeb) {
    memoryStore.lists = memoryStore.lists.filter(l => l.id !== id || l.is_inbox);
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('DELETE FROM lists WHERE id = ? AND is_inbox = 0', [id]);
}

export async function deleteTagById(id: string): Promise<void> {
  if (isWeb) {
    memoryStore.tags = memoryStore.tags.filter(t => t.id !== id);
    return;
  }
  
  const database = await getDb();
  if (!database) return;
  
  await database.runAsync('DELETE FROM tags WHERE id = ?', [id]);
}
