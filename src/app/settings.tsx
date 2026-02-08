// Settings screen with sync configuration

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.comment }]}>Sync Settings</Text>
        
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          {/* Enable Sync */}
          <View style={[styles.row, { borderBottomColor: colors.backgroundTertiary }]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <Feather name="refresh-cw" size={18} color={colors.cyan} />
            </View>
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
              <Feather name="check-circle" size={14} color={colors.green} />
              <Text style={[styles.statusValue, { color: colors.comment }]}>
                Last synced {new Date(syncStatus.last_sync).toLocaleString()}
              </Text>
            </View>
          )}

          {syncStatus.last_error && (
            <View style={[styles.status, styles.statusError]}>
              <Feather name="alert-circle" size={14} color={colors.red} />
              <Text style={[styles.statusValue, { color: colors.red }]}>
                {syncStatus.last_error}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.purple }]} onPress={handleSave}>
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.syncButton, { backgroundColor: colors.backgroundSecondary }, (!enabled || !server || !token) && styles.buttonDisabled]} 
          onPress={handleTestSync}
          disabled={!enabled || !server || !token || syncStatus.syncing}
        >
          <Feather name="refresh-cw" size={18} color={colors.foreground} />
          <Text style={[styles.syncButtonText, { color: colors.foreground }]}>
            {syncStatus.syncing ? 'Syncing...' : 'Test Sync Now'}
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        {Platform.OS !== 'web' && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.xl, color: colors.comment }]}>Notifications</Text>
            
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <View style={[styles.rowIcon, { backgroundColor: colors.backgroundTertiary }]}>
                  <Feather name="bell" size={18} color={colors.orange} />
                </View>
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
            <View style={[styles.rowIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <Feather name="moon" size={18} color={colors.purple} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Theme</Text>
              <Text style={[styles.rowDescription, { color: colors.comment }]}>{theme.displayName}</Text>
            </View>
            <View style={styles.themePreview}>
              <View style={[styles.previewDot, { backgroundColor: colors.red }]} />
              <View style={[styles.previewDot, { backgroundColor: colors.orange }]} />
              <View style={[styles.previewDot, { backgroundColor: colors.yellow }]} />
              <View style={[styles.previewDot, { backgroundColor: colors.green }]} />
              <View style={[styles.previewDot, { backgroundColor: colors.purple }]} />
            </View>
            <Feather name="chevron-right" size={20} color={colors.comment} />
          </View>
        </TouchableOpacity>

        {/* About */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl, color: colors.comment }]}>About</Text>
        
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={[styles.aboutRow, { borderBottomColor: colors.backgroundTertiary }]}>
            <Text style={[styles.aboutLabel, { color: colors.comment }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.foreground }]}>1.0.0</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.aboutLabel, { color: colors.comment }]}>Sync Server</Text>
            <Text style={[styles.aboutValue, { color: colors.foreground }]}>tickit-sync</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
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
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  statusError: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 0,
  },
  statusValue: {
    fontSize: fontSize.sm,
    flex: 1,
    marginLeft: spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#fff',
    marginLeft: spacing.sm,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
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
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 4,
  },
});
