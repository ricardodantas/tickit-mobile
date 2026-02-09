// Global state management with Zustand

import { create } from 'zustand';
import { Task, List, Tag, SyncConfig, SyncStatus } from '../types';
import * as db from '../services/database';
import * as syncService from '../services/sync';
import * as notifications from '../services/notifications';

// Auto-sync interval reference
let syncIntervalId: ReturnType<typeof setInterval> | null = null;

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
  notificationsEnabled: boolean;
  
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
  syncAfterChange: () => void;
  sync: () => Promise<void>;
  forceFullSync: () => Promise<void>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
  
  // Notification actions
  enableNotifications: () => Promise<boolean>;
  syncNotifications: () => Promise<void>;
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
  notificationsEnabled: false,
  
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
      
      // Request notification permissions
      const notificationsEnabled = await notifications.requestPermissions();
      set({ notificationsEnabled });
      
      // Sync notifications for all tasks with due dates
      if (notificationsEnabled) {
        await notifications.syncAllReminders(get().tasks);
      }
      
      // Auto-sync if enabled
      if (syncService.isSyncEnabled(syncConfig)) {
        get().sync().catch(console.error);
        get().startAutoSync();
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
    const newTask = await db.createTask(task);
    await get().refreshData();
    
    // Schedule notification if task has due date
    if (newTask.due_date && get().notificationsEnabled) {
      await notifications.scheduleTaskReminder(newTask);
      if (newTask.priority === 'high' || newTask.priority === 'urgent') {
        await notifications.scheduleTaskReminderAdvance(newTask, 24);
      }
    }
    
    // Sync after change
    get().syncAfterChange();
  },
  
  updateTask: async (task) => {
    await db.updateTask(task);
    await get().refreshData();
    
    // Update notification
    if (get().notificationsEnabled) {
      if (task.due_date && !task.completed) {
        await notifications.scheduleTaskReminder(task);
        if (task.priority === 'high' || task.priority === 'urgent') {
          await notifications.scheduleTaskReminderAdvance(task, 24);
        }
      } else {
        await notifications.cancelTaskReminder(task.id);
      }
    }
    
    // Sync after change
    get().syncAfterChange();
  },
  
  deleteTask: async (id) => {
    await notifications.cancelTaskReminder(id);
    await db.deleteTask(id);
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
  },
  
  toggleTask: async (id) => {
    await db.toggleTaskComplete(id);
    await get().refreshData();
    
    // Cancel notification if task completed
    const task = get().tasks.find(t => t.id === id);
    if (task?.completed) {
      await notifications.cancelTaskReminder(id);
    } else if (task?.due_date && get().notificationsEnabled) {
      await notifications.scheduleTaskReminder(task);
    }
    
    // Sync after change
    get().syncAfterChange();
  },
  
  // List actions
  addList: async (list) => {
    await db.createList(list);
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
  },
  
  updateList: async (list) => {
    await db.updateList(list);
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
  },
  
  deleteList: async (id) => {
    await db.deleteList(id);
    const { selectedListId, lists } = get();
    if (selectedListId === id) {
      const inbox = lists.find(l => l.is_inbox);
      set({ selectedListId: inbox?.id ?? null });
    }
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
  },
  
  selectList: (id) => {
    set({ selectedListId: id });
  },
  
  // Tag actions
  addTag: async (tag) => {
    await db.createTag(tag);
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
  },
  
  updateTag: async (tag) => {
    await db.updateTag(tag);
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
  },
  
  deleteTag: async (id) => {
    await db.deleteTag(id);
    await get().refreshData();
    
    // Sync after change
    get().syncAfterChange();
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
    
    // Restart auto-sync with new config
    get().stopAutoSync();
    if (syncService.isSyncEnabled(config)) {
      get().startAutoSync();
      // Sync immediately when config is saved
      get().sync().catch(console.error);
    }
  },
  
  // Helper to trigger sync after data changes (non-blocking)
  syncAfterChange: async () => {
    const { syncConfig, syncStatus } = get();
    if (!syncService.isSyncEnabled(syncConfig)) return;
    if (syncStatus.syncing) return; // Already syncing
    
    // Small delay to batch rapid changes
    setTimeout(async () => {
      try {
        console.log('[Store] Auto-sync after change');
        await get().sync();
      } catch (e) {
        console.log('[Store] Auto-sync failed:', e);
      }
    }, 500);
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
  
  startAutoSync: () => {
    const { syncConfig } = get();
    
    // Clear existing interval
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
    
    if (!syncService.isSyncEnabled(syncConfig)) return;
    
    // Default to 5 minutes if not set
    const intervalMs = (syncConfig.interval_secs || 300) * 1000;
    
    console.log(`[Sync] Starting auto-sync every ${intervalMs / 1000}s`);
    
    syncIntervalId = setInterval(() => {
      console.log('[Sync] Auto-sync triggered');
      get().sync().catch(console.error);
    }, intervalMs);
  },
  
  stopAutoSync: () => {
    if (syncIntervalId) {
      console.log('[Sync] Stopping auto-sync');
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
  },
  
  forceFullSync: async () => {
    const { syncConfig } = get();
    if (!syncService.isSyncEnabled(syncConfig)) return;
    
    set(state => ({
      syncStatus: { ...state.syncStatus, syncing: true, last_error: null },
    }));
    
    try {
      const result = await syncService.forceFullSync();
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
  
  // Notification actions
  enableNotifications: async () => {
    const enabled = await notifications.requestPermissions();
    set({ notificationsEnabled: enabled });
    
    if (enabled) {
      await notifications.syncAllReminders(get().tasks);
    }
    
    return enabled;
  },
  
  syncNotifications: async () => {
    if (get().notificationsEnabled) {
      await notifications.syncAllReminders(get().tasks);
    }
  },
}));

// Selectors
export const useFilteredTasks = () => {
  const { tasks, showCompleted } = useStore();
  
  return tasks.filter(task => {
    // Always show all tasks from all lists (inbox behavior)
    if (!showCompleted && task.completed) return false;
    return true;
  });
};

export const useSelectedList = () => {
  const { lists, selectedListId } = useStore();
  return lists.find(l => l.id === selectedListId);
};
