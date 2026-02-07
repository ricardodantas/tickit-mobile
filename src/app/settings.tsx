// Settings screen with sync configuration

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';
import { SyncConfig } from '../types';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.comment }]}>Sync Settings</Text>
      
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Enable Sync */}
        <View style={[styles.row, { borderBottomColor: colors.backgroundTertiary }]}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Enable Sync</Text>
            <Text style={[styles.rowDescription, { color: colors.comment }]}>Sync tasks across devices</Text>
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
          <Text style={[styles.label, { color: colors.comment }]}>Server URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.backgroundTertiary }]}
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
          <Text style={[styles.label, { color: colors.comment }]}>API Token</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.backgroundTertiary }]}
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
          <Text style={[styles.label, { color: colors.comment }]}>Sync Interval (seconds)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.backgroundTertiary }]}
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
          <View style={[styles.status, { borderTopColor: colors.backgroundTertiary }]}>
            <Text style={[styles.statusLabel, { color: colors.comment }]}>Last Sync:</Text>
            <Text style={[styles.statusValue, { color: colors.foreground }]}>
              {new Date(syncStatus.last_sync).toLocaleString()}
            </Text>
          </View>
        )}

        {syncStatus.last_error && (
          <View style={[styles.status, styles.statusError]}>
            <Text style={[styles.statusLabel, { color: colors.comment }]}>Error:</Text>
            <Text style={[styles.statusValue, { color: colors.red }]}>
              {syncStatus.last_error}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.purple }]} onPress={handleSave}>
        <Text style={[styles.saveButtonText, { color: colors.foreground }]}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.syncButton, { backgroundColor: colors.backgroundTertiary }, (!enabled || !server || !token) && styles.buttonDisabled]} 
        onPress={handleTestSync}
        disabled={!enabled || !server || !token || syncStatus.syncing}
      >
        <Text style={[styles.syncButtonText, { color: colors.foreground }]}>
          {syncStatus.syncing ? 'Syncing...' : 'Test Sync Now'}
        </Text>
      </TouchableOpacity>

      {/* Notifications */}
      {Platform.OS !== 'web' && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl, color: colors.comment }]}>Notifications</Text>
          
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[styles.row, { borderBottomColor: colors.backgroundTertiary }]}>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>Due Date Reminders</Text>
                <Text style={[styles.rowDescription, { color: colors.comment }]}>
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
            
            <Text style={[styles.notificationInfo, { color: colors.comment }]}>
              🔔 Tasks with due dates will notify at 9:00 AM{'\n'}
              ⚡ High/Urgent tasks also notify 24 hours before
            </Text>
          </View>
        </>
      )}

      {/* Appearance */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.xl, color: colors.comment }]}>Appearance</Text>
      
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}
        onPress={() => router.push('/themes' as any)}
        activeOpacity={0.7}
      >
        <View style={styles.themeRow}>
          <View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Theme</Text>
            <Text style={[styles.rowDescription, { color: colors.comment }]}>{theme.displayName}</Text>
          </View>
          <View style={styles.themePreview}>
            <View style={[styles.previewDot, { backgroundColor: colors.red }]} />
            <View style={[styles.previewDot, { backgroundColor: colors.orange }]} />
            <View style={[styles.previewDot, { backgroundColor: colors.yellow }]} />
            <View style={[styles.previewDot, { backgroundColor: colors.green }]} />
            <View style={[styles.previewDot, { backgroundColor: colors.purple }]} />
            <Text style={[styles.chevron, { color: colors.comment }]}>›</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* About */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.xl, color: colors.comment }]}>About</Text>
      
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.aboutRow, { borderBottomColor: colors.backgroundTertiary }]}>
          <Text style={[styles.aboutLabel, { color: colors.comment }]}>Version</Text>
          <Text style={[styles.aboutValue, { color: colors.foreground }]}>1.0.0</Text>
        </View>
        <View style={[styles.aboutRow, { borderBottomColor: colors.backgroundTertiary }]}>
          <Text style={[styles.aboutLabel, { color: colors.comment }]}>Sync Server</Text>
          <Text style={[styles.aboutValue, { color: colors.foreground }]}>tickit-sync</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  statusError: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 0,
  },
  statusLabel: {
    fontSize: fontSize.sm,
  },
  statusValue: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  syncButton: {
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
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  aboutLabel: {
    fontSize: fontSize.md,
  },
  aboutValue: {
    fontSize: fontSize.md,
  },
  notificationInfo: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chevron: {
    fontSize: fontSize.xl,
    marginLeft: spacing.sm,
  },
});
