// Tasks screen - main task list

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useStore, useFilteredTasks, useSelectedList } from '../../store';
import { colors, spacing, borderRadius, fontSize } from '../../theme';
import { Task, Priority } from '../../types';

export default function TasksScreen() {
  const router = useRouter();
  const tasks = useFilteredTasks();
  const selectedList = useSelectedList();
  const lists = useStore(state => state.lists);
  const toggleTask = useStore(state => state.toggleTask);
  const syncStatus = useStore(state => state.syncStatus);
  const sync = useStore(state => state.sync);

  const handleToggle = async (id: string) => {
    await toggleTask(id);
  };

  return (
    <View style={styles.container}>
      {/* Header with list selector */}
      <View style={styles.header}>
        <Text style={styles.title}>{selectedList?.icon} {selectedList?.name ?? 'All Tasks'}</Text>
        <View style={styles.headerRight}>
          {syncStatus.syncing ? (
            <Text style={styles.syncText}>Syncing...</Text>
          ) : syncStatus.last_error ? (
            <TouchableOpacity onPress={sync}>
              <Text style={styles.syncError}>⚠️ Tap to retry</Text>
            </TouchableOpacity>
          ) : null}
          <Link href="/settings" asChild>
            <TouchableOpacity>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Task list */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem 
            task={item} 
            onToggle={() => handleToggle(item.id)}
            onPress={() => router.push(`/task/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
          </View>
        }
      />

      {/* FAB */}
      <Link href="/task/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function TaskItem({ task, onToggle, onPress }: { task: Task; onToggle: () => void; onPress: () => void }) {
  const priorityColor = getPriorityColor(task.priority);
  
  return (
    <Pressable 
      style={({ pressed }) => [styles.taskItem, pressed && styles.taskItemPressed]}
      onPress={onPress}
    >
      <TouchableOpacity 
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={onToggle}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        {task.due_date && (
          <Text style={[styles.taskDue, isDueOverdue(task.due_date) && styles.taskDueOverdue]}>
            📅 {formatDate(task.due_date)}
          </Text>
        )}
      </View>
      
      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
    </Pressable>
  );
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'urgent': return colors.red;
    case 'high': return colors.orange;
    case 'medium': return colors.cyan;
    case 'low': return colors.comment;
  }
}

function isDueOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

function formatDate(date: string): string {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.foreground,
  },
  settingsIcon: {
    fontSize: 24,
  },
  syncText: {
    fontSize: fontSize.sm,
    color: colors.comment,
  },
  syncError: {
    fontSize: fontSize.sm,
    color: colors.red,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  taskItemPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.comment,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkmark: {
    color: colors.background,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.comment,
  },
  taskDue: {
    fontSize: fontSize.sm,
    color: colors.comment,
    marginTop: 4,
  },
  taskDueOverdue: {
    color: colors.red,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.foreground,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.comment,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: colors.foreground,
    fontWeight: '300',
  },
});
