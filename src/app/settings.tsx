// Settings screen with sync configuration

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { SyncConfig } from '../types';

export default function SettingsScreen() {
  const router = useRouter();
  const syncConfig = useStore(state => state.syncConfig);
  const syncStatus = useStore(state => state.syncStatus);
  const saveSyncConfig = useStore(state => state.saveSyncConfig);
  const sync = useStore(state => state.sync);
  const notificationsEnabled = useStore(state => state.notificationsEnabled);
  const enableNotifications = useStore(state => state.enableNotifications);

  const [enabled, setEnabled] = useState(syncConfig.enabled);
  const [server, setServer] = useState(syncConfig.server || '');
  const [token, setToken] = useState(syncConfig.token || '');
  const [interval, setInterval] = useState(String(syncConfig.interval_secs));

  useEffect(() => {
    setEnabled(syncConfig.enabled);
    setServer(syncConfig.server || '');
    setToken(syncConfig.token || '');
    setInterval(String(syncConfig.interval_secs));
  }, [syncConfig]);

  const handleSave = async () => {
    const config: SyncConfig = {
      enabled,
      server: server.trim() || null,
      token: token.trim() || null,
      interval_secs: parseInt(interval) || 300,
    };

    await saveSyncConfig(config);
    Alert.alert('Settings Saved', 'Your sync settings have been saved.');
  };

  const handleTestSync = async () => {
    if (!enabled || !server || !token) {
      Alert.alert('Cannot Sync', 'Please enable sync and configure server and token first.');
      return;
    }

    try {
      await handleSave();
      await sync();
      Alert.alert('Sync Complete', 'Successfully synced with server!');
    } catch (e) {
      Alert.alert('Sync Failed', String(e));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Sync Settings</Text>
      
      <View style={styles.card}>
        {/* Enable Sync */}
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Enable Sync</Text>
            <Text style={styles.rowDescription}>Sync tasks across devices</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: colors.backgroundTertiary, true: colors.purple }}
            thumbColor={colors.foreground}
          />
        </View>

        {/* Server URL */}
        <View style={styles.field}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={server}
            onChangeText={setServer}
            placeholder="https://sync.example.com"
            placeholderTextColor={colors.comment}
            autoCapitalize="none"
            autoCorrect={false}
            editable={enabled}
          />
        </View>

        {/* Token */}
        <View style={styles.field}>
          <Text style={styles.label}>API Token</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="tks_your_token_here"
            placeholderTextColor={colors.comment}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={enabled}
          />
        </View>

        {/* Interval */}
        <View style={styles.field}>
          <Text style={styles.label}>Sync Interval (seconds)</Text>
          <TextInput
            style={styles.input}
            value={interval}
            onChangeText={setInterval}
            placeholder="300"
            placeholderTextColor={colors.comment}
            keyboardType="numeric"
            editable={enabled}
          />
        </View>

        {/* Sync Status */}
        {syncStatus.last_sync && (
          <View style={styles.status}>
            <Text style={styles.statusLabel}>Last Sync:</Text>
            <Text style={styles.statusValue}>
              {new Date(syncStatus.last_sync).toLocaleString()}
            </Text>
          </View>
        )}

        {syncStatus.last_error && (
          <View style={[styles.status, styles.statusError]}>
            <Text style={styles.statusLabel}>Error:</Text>
            <Text style={[styles.statusValue, { color: colors.red }]}>
              {syncStatus.last_error}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.syncButton, (!enabled || !server || !token) && styles.buttonDisabled]} 
        onPress={handleTestSync}
        disabled={!enabled || !server || !token || syncStatus.syncing}
      >
        <Text style={styles.syncButtonText}>
          {syncStatus.syncing ? 'Syncing...' : 'Test Sync Now'}
        </Text>
      </TouchableOpacity>

      {/* Notifications */}
      {Platform.OS !== 'web' && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Notifications</Text>
          
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Due Date Reminders</Text>
                <Text style={styles.rowDescription}>
                  {notificationsEnabled 
                    ? 'Get notified when tasks are due' 
                    : 'Enable to receive reminders'}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  if (value) {
                    const granted = await enableNotifications();
                    if (!granted) {
                      Alert.alert(
                        'Permission Required',
                        'Please enable notifications in your device settings to receive due date reminders.'
                      );
                    }
                  }
                }}
                trackColor={{ false: colors.backgroundTertiary, true: colors.purple }}
                thumbColor={colors.foreground}
              />
            </View>
            
            <Text style={styles.notificationInfo}>
              🔔 Tasks with due dates will notify at 9:00 AM{'\n'}
              ⚡ High/Urgent tasks also notify 24 hours before
            </Text>
          </View>
        </>
      )}

      {/* About */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>About</Text>
      
      <View style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Sync Server</Text>
          <Text style={styles.aboutValue}>tickit-sync</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.comment,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
    marginBottom: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.foreground,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: fontSize.sm,
    color: colors.comment,
    marginTop: 2,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.comment,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  statusError: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 0,
  },
  statusLabel: {
    fontSize: fontSize.sm,
    color: colors.comment,
  },
  statusValue: {
    fontSize: fontSize.sm,
    color: colors.foreground,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.purple,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  syncButton: {
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  aboutLabel: {
    fontSize: fontSize.md,
    color: colors.comment,
  },
  aboutValue: {
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  notificationInfo: {
    fontSize: fontSize.sm,
    color: colors.comment,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
