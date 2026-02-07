// Global state management with Zustand

import { create } from 'zustand';
import { Task, List, Tag, SyncConfig, SyncStatus } from '../types';
import * as db from '../services/database';
import * as syncService from '../services/sync';

interface AppState {
  // Data
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  
  // UI state
  selectedListId: string | null;
  showCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Sync
  syncConfig: SyncConfig;
  syncStatus: SyncStatus;
  
  // Actions
  initialize: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  
  // List actions
  addList: (list: Omit<List, 'id' | 'is_inbox' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateList: (list: List) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  selectList: (id: string | null) => void;
  
  // Tag actions
  addTag: (tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTag: (tag: Tag) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  
  // UI actions
  toggleShowCompleted: () => void;
  setError: (error: string | null) => void;
  
  // Sync actions
  loadSyncConfig: () => Promise<void>;
  saveSyncConfig: (config: SyncConfig) => Promise<void>;
  sync: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  tasks: [],
  lists: [],
  tags: [],
  selectedListId: null,
  showCompleted: false,
  isLoading: true,
  error: null,
  syncConfig: {
    enabled: false,
    server: null,
    token: null,
    interval_secs: 300,
  },
  syncStatus: {
    syncing: false,
    last_sync: null,
    last_error: null,
    pending_changes: 0,
  },
  
  // Initialize app
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Initialize database
      await db.initDatabase();
      
      // Load sync config
      const syncConfig = await syncService.getSyncConfig();
      set({ syncConfig });
      
      // Load data
      await get().refreshData();
      
      // Select inbox by default
      const inbox = get().lists.find(l => l.is_inbox);
      if (inbox) {
        set({ selectedListId: inbox.id });
      }
      
      set({ isLoading: false });
      
      // Auto-sync if enabled
      if (syncService.isSyncEnabled(syncConfig)) {
        get().sync().catch(console.error);
      }
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },
  
  // Refresh all data from database
  refreshData: async () => {
    const [tasks, lists, tags] = await Promise.all([
      db.getAllTasks(),
      db.getLists(),
      db.getTags(),
    ]);
    set({ tasks, lists, tags });
  },
  
  // Task actions
  addTask: async (task) => {
    await db.createTask(task);
    await get().refreshData();
  },
  
  updateTask: async (task) => {
    await db.updateTask(task);
    await get().refreshData();
  },
  
  deleteTask: async (id) => {
    await db.deleteTask(id);
    await get().refreshData();
  },
  
  toggleTask: async (id) => {
    await db.toggleTaskComplete(id);
    await get().refreshData();
  },
  
  // List actions
  addList: async (list) => {
    await db.createList(list);
    await get().refreshData();
  },
  
  updateList: async (list) => {
    await db.updateList(list);
    await get().refreshData();
  },
  
  deleteList: async (id) => {
    await db.deleteList(id);
    const { selectedListId, lists } = get();
    if (selectedListId === id) {
      const inbox = lists.find(l => l.is_inbox);
      set({ selectedListId: inbox?.id ?? null });
    }
    await get().refreshData();
  },
  
  selectList: (id) => {
    set({ selectedListId: id });
  },
  
  // Tag actions
  addTag: async (tag) => {
    await db.createTag(tag);
    await get().refreshData();
  },
  
  updateTag: async (tag) => {
    await db.updateTag(tag);
    await get().refreshData();
  },
  
  deleteTag: async (id) => {
    await db.deleteTag(id);
    await get().refreshData();
  },
  
  // UI actions
  toggleShowCompleted: () => {
    set(state => ({ showCompleted: !state.showCompleted }));
  },
  
  setError: (error) => {
    set({ error });
  },
  
  // Sync actions
  loadSyncConfig: async () => {
    const syncConfig = await syncService.getSyncConfig();
    set({ syncConfig });
  },
  
  saveSyncConfig: async (config) => {
    await syncService.saveSyncConfig(config);
    set({ syncConfig: config });
  },
  
  sync: async () => {
    const { syncConfig } = get();
    if (!syncService.isSyncEnabled(syncConfig)) return;
    
    set(state => ({
      syncStatus: { ...state.syncStatus, syncing: true, last_error: null },
    }));
    
    try {
      const result = await syncService.sync();
      await get().refreshData();
      
      set(state => ({
        syncStatus: {
          ...state.syncStatus,
          syncing: false,
          last_sync: new Date().toISOString(),
          last_error: null,
        },
      }));
    } catch (e) {
      set(state => ({
        syncStatus: {
          ...state.syncStatus,
          syncing: false,
          last_error: String(e),
        },
      }));
    }
  },
}));

// Selectors
export const useFilteredTasks = () => {
  const { tasks, selectedListId, showCompleted } = useStore();
  
  return tasks.filter(task => {
    if (selectedListId && task.list_id !== selectedListId) return false;
    if (!showCompleted && task.completed) return false;
    return true;
  });
};

export const useSelectedList = () => {
  const { lists, selectedListId } = useStore();
  return lists.find(l => l.id === selectedListId);
};
