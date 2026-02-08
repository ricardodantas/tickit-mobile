// Sync service for communicating with tickit-sync server

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { SyncRequest, SyncResponse, SyncRecord, SyncConfig } from '../types';
import * as db from './database';

// Generate UUID using expo-crypto
function uuidv4(): string {
  return Crypto.randomUUID();
}

const DEVICE_ID_KEY = 'tickit_device_id';
const SYNC_CONFIG_KEY = 'tickit_sync_config';

let deviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  
  let stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!stored) {
    stored = uuidv4();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, stored);
  }
  
  deviceId = stored;
  return stored;
}

export async function getSyncConfig(): Promise<SyncConfig> {
  const stored = await SecureStore.getItemAsync(SYNC_CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    enabled: false,
    server: null,
    token: null,
    interval_secs: 300,
  };
}

export async function saveSyncConfig(config: SyncConfig): Promise<void> {
  await SecureStore.setItemAsync(SYNC_CONFIG_KEY, JSON.stringify(config));
}

export function isSyncEnabled(config: SyncConfig): boolean {
  return config.enabled && !!config.server && !!config.token;
}

export async function forceFullSync(): Promise<{ applied: number; conflicts: string[] }> {
  console.log('[Sync] Force full sync - clearing lastSync');
  await db.clearLastSync();
  return sync();
}

export async function sync(): Promise<{ applied: number; conflicts: string[] }> {
  const config = await getSyncConfig();
  
  if (!isSyncEnabled(config)) {
    throw new Error('Sync not configured');
  }
  
  const device = await getDeviceId();
  const lastSync = await db.getLastSync();
  
  console.log('[Sync] Starting sync, lastSync:', lastSync);
  
  // Gather local changes
  const changes = await gatherLocalChanges(lastSync);
  
  const request: SyncRequest = {
    device_id: device,
    last_sync: lastSync,
    changes,
  };
  
  console.log('[Sync] Sending', changes.length, 'local changes');
  
  // Send to server
  const response = await fetch(`${config.server}/api/v1/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sync failed: ${response.status} ${text}`);
  }
  
  const syncResponse: SyncResponse = await response.json();
  
  console.log('[Sync] Received', syncResponse.changes.length, 'changes from server');
  
  // Apply incoming changes
  const applied = await applyIncomingChanges(syncResponse);
  
  console.log('[Sync] Applied', applied, 'changes');
  
  // Update last sync time
  await db.setLastSync(syncResponse.server_time);
  
  return { applied, conflicts: syncResponse.conflicts };
}

async function gatherLocalChanges(lastSync: string | null): Promise<SyncRecord[]> {
  const changes: SyncRecord[] = [];
  
  if (lastSync) {
    // Incremental sync
    const tasks = await db.getTasksSince(lastSync);
    for (const task of tasks) {
      changes.push({ type: 'task', ...task });
    }
    
    const lists = await db.getListsSince(lastSync);
    for (const list of lists) {
      changes.push({ type: 'list', ...list });
    }
    
    const tags = await db.getTagsSince(lastSync);
    for (const tag of tags) {
      changes.push({ type: 'tag', ...tag });
    }
    
    const tombstones = await db.getTombstonesSince(lastSync);
    for (const tomb of tombstones) {
      changes.push({
        type: 'deleted',
        id: tomb.id,
        record_type: tomb.record_type as any,
        deleted_at: tomb.deleted_at,
      });
    }
  } else {
    // Full sync
    const tasks = await db.getAllTasks();
    for (const task of tasks) {
      changes.push({ type: 'task', ...task });
    }
    
    const lists = await db.getLists();
    for (const list of lists) {
      changes.push({ type: 'list', ...list });
    }
    
    const tags = await db.getTags();
    for (const tag of tags) {
      changes.push({ type: 'tag', ...tag });
    }
  }
  
  return changes;
}

async function applyIncomingChanges(response: SyncResponse): Promise<number> {
  let applied = 0;
  
  console.log('[Sync] Applying changes, total:', response.changes.length);
  
  for (const record of response.changes) {
    try {
      console.log('[Sync] Processing record type:', record.type, 'id:', (record as any).id);
      switch (record.type) {
        case 'task':
          await db.upsertTask(record as any);
          applied++;
          break;
        case 'list':
          console.log('[Sync] Upserting list:', (record as any).name);
          await db.upsertList(record as any);
          applied++;
          break;
        case 'tag':
          console.log('[Sync] Upserting tag:', (record as any).name);
          await db.upsertTag(record as any);
          applied++;
          break;
        case 'deleted':
          const deleted = record as { id: string; record_type: string };
          switch (deleted.record_type) {
            case 'task':
              await db.deleteTaskById(deleted.id);
              break;
            case 'list':
              await db.deleteListById(deleted.id);
              break;
            case 'tag':
              await db.deleteTagById(deleted.id);
              break;
          }
          applied++;
          break;
      }
    } catch (e) {
      console.error('Failed to apply change:', record, e);
    }
  }
  
  return applied;
}
