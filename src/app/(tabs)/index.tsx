// Tasks screen - main task list

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStore, useFilteredTasks, useSelectedList } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Task, Priority } from '../../types';

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useFilteredTasks();
  const selectedList = useSelectedList();
  const toggleTask = useStore(state => state.toggleTask);
  const syncStatus = useStore(state => state.syncStatus);
  const sync = useStore(state => state.sync);

  const incompleteTasks = tasks.filter(t => !t.completed);

  const handleToggle = async (id: string) => {
    await toggleTask(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>{selectedList?.name ?? 'All Tasks'}</Text>
          <Text style={[styles.subtitle, { color: colors.comment }]}>
            {incompleteTasks.length} {incompleteTasks.length === 1 ? 'task' : 'tasks'} remaining
          </Text>
        </View>
        <View style={styles.headerRight}>
          {syncStatus.syncing && (
            <Feather name="refresh-cw" size={18} color={colors.comment} style={styles.syncIcon} />
          )}
          {syncStatus.last_error && !syncStatus.syncing && (
            <TouchableOpacity onPress={sync} style={styles.headerButton}>
              <Feather name="alert-circle" size={20} color={colors.red} />
            </TouchableOpacity>
          )}
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.headerButton}>
              <Feather name="settings" size={20} color={colors.comment} />
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
            colors={colors}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Feather name="check-circle" size={32} color={colors.green} />
            </View>
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No tasks yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.comment }]}>Tap + to add your first task</Text>
          </View>
        }
      />

      {/* FAB */}
      <Link href="/task/new" asChild>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.purple }]}>
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function TaskItem({ task, onToggle, onPress, colors }: { task: Task; onToggle: () => void; onPress: () => void; colors: any }) {
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'urgent': return colors.red;
      case 'high': return colors.orange;
      case 'medium': return colors.cyan;
      case 'low': return colors.comment;
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  
  return (
    <Pressable 
      style={({ pressed }) => [styles.taskItem, { backgroundColor: colors.backgroundSecondary }, pressed && styles.taskItemPressed]}
      onPress={onPress}
    >
      <TouchableOpacity 
        style={[styles.checkbox, { borderColor: colors.comment }, task.completed && { backgroundColor: colors.green, borderColor: colors.green }]}
        onPress={onToggle}
      >
        {task.completed && <Feather name="check" size={14} color={colors.background} />}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, { color: colors.foreground }, task.completed && { textDecorationLine: 'line-through', color: colors.comment }]}>
          {task.title}
        </Text>
        {task.due_date && (
          <View style={styles.taskMeta}>
            <Feather 
              name="calendar" 
              size={12} 
              color={isDueOverdue(task.due_date) && !task.completed ? colors.red : colors.comment} 
            />
            <Text style={[styles.taskDue, { color: colors.comment }, isDueOverdue(task.due_date) && !task.completed && { color: colors.red }]}>
              {formatDate(task.due_date)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
      <Feather name="chevron-right" size={16} color={colors.comment} />
    </Pressable>
  );
}

function isDueOverdue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDate(date: string): string {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  syncIcon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  taskItemPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  taskDue: {
    fontSize: fontSize.xs,
    marginLeft: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
