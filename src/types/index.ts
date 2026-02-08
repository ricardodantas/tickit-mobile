// Data models matching the Tickit desktop/sync server

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  priority: Priority;
  completed: boolean;
  list_id: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  tag_ids?: string[]; // Optional: populated when loading tasks with tags
}

export interface List {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string | null;
  is_inbox: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TaskTagLink {
  task_id: string;
  tag_id: string;
  created_at: string;
}

// Sync types
export type RecordType = 'task' | 'list' | 'tag' | 'task_tag';

export type SyncRecord =
  | { type: 'task'; } & Task
  | { type: 'list'; } & List
  | { type: 'tag'; } & Tag
  | { type: 'task_tag'; } & TaskTagLink
  | { type: 'deleted'; id: string; record_type: RecordType; deleted_at: string };

export interface SyncRequest {
  device_id: string;
  last_sync: string | null;
  changes: SyncRecord[];
}

export interface SyncResponse {
  server_time: string;
  changes: SyncRecord[];
  conflicts: string[];
}

export interface SyncConfig {
  enabled: boolean;
  server: string | null;
  token: string | null;
  interval_secs: number;
}

export interface SyncStatus {
  syncing: boolean;
  last_sync: string | null;
  last_error: string | null;
  pending_changes: number;
}
