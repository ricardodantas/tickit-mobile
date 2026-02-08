// Tasks screen - main task list

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStore, useFilteredTasks } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Task, Priority } from '../../types';

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const tasks = useFilteredTasks();
  const allTasks = useStore(state => state.tasks);
  const lists = useStore(state => state.lists);
  const allTags = useStore(state => state.tags);
  const toggleTask = useStore(state => state.toggleTask);
  const showCompleted = useStore(state => state.showCompleted);
  const toggleShowCompleted = useStore(state => state.toggleShowCompleted);
  const syncStatus = useStore(state => state.syncStatus);
  const sync = useStore(state => state.sync);

  const incompleteTasks = allTasks.filter(t => !t.completed);
  const completedTasks = allTasks.filter(t => t.completed);

  const handleToggle = async (id: string) => {
    await toggleTask(id);
  };

  const getList = (listId: string) => lists.find(l => l.id === listId);
  const getTaskTags = (tagIds?: string[]) => {
    if (!tagIds || tagIds.length === 0) return [];
    return allTags.filter(t => tagIds.includes(t.id));
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'urgent': return colors.red;
      case 'high': return colors.orange;
      case 'medium': return colors.cyan;
      case 'low': return colors.comment;
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const priorityColor = getPriorityColor(item.priority);
    const isOverdue = item.due_date && isDueOverdue(item.due_date) && !item.completed;
    const list = getList(item.list_id);
    const taskTags = getTaskTags(item.tag_ids);
    
    return (
      <Pressable 
        style={[styles.taskItem, { backgroundColor: colors.backgroundSecondary }]}
        onPress={() => router.push(`/task/${item.id}`)}
      >
        <TouchableOpacity 
          style={[
            styles.checkbox, 
            { borderColor: colors.comment }, 
            item.completed && { backgroundColor: colors.green, borderColor: colors.green }
          ]}
          onPress={() => handleToggle(item.id)}
        >
          {item.completed && <Feather name="check" size={14} color={colors.background} />}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text 
            style={[
              styles.taskTitle, 
              { color: colors.foreground }, 
              item.completed && { textDecorationLine: 'line-through', color: colors.comment }
            ]}
          >
            {item.title}
          </Text>
          
          {/* Meta row: due date, list, tags */}
          <View style={styles.taskMeta}>
            {item.due_date && (
              <View style={styles.metaItem}>
                <Feather 
                  name="calendar" 
                  size={11} 
                  color={isOverdue ? colors.red : colors.comment} 
                />
                <Text style={[styles.metaText, { color: isOverdue ? colors.red : colors.comment }]}>
                  {formatDate(item.due_date)}
                </Text>
              </View>
            )}
            {list && !list.is_inbox && (
              <View style={styles.metaItem}>
                <Feather name="folder" size={11} color={colors.comment} />
                <Text style={[styles.metaText, { color: colors.comment }]}>{list.name}</Text>
              </View>
            )}
            {taskTags.map(tag => (
              <View key={tag.id} style={[styles.tagBadge, { backgroundColor: tag.color + '22' }]}>
                <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
        <Feather name="chevron-right" size={16} color={colors.comment} />
      </Pressable>
    );
  };

  const headerRight = (
    <>
      {/* Show/hide completed toggle */}
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={toggleShowCompleted}
      >
        <Feather 
          name={showCompleted ? 'eye' : 'eye-off'} 
          size={20} 
          color={showCompleted ? colors.purple : colors.comment} 
        />
      </TouchableOpacity>
      {syncStatus.syncing && (
        <Feather name="refresh-cw" size={18} color={colors.comment} style={styles.syncIcon} />
      )}
      {syncStatus.last_error && !syncStatus.syncing && (
        <TouchableOpacity onPress={sync} style={styles.headerButton}>
          <Feather name="alert-circle" size={20} color={colors.red} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
        <Feather name="settings" size={20} color={colors.comment} />
      </TouchableOpacity>
    </>
  );

  return (
    <ScreenWrapper
      header={{
        title: 'Inbox',
        subtitle: `${incompleteTasks.length} remaining${completedTasks.length > 0 ? ` · ${completedTasks.length} done` : ''}`,
        rightContent: headerRight,
      }}
    >
      {/* Task list */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
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
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.purple }]}
        onPress={() => router.push('/task/new')}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenWrapper>
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
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  syncIcon: {
    marginRight: spacing.sm,
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
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: fontSize.xs,
    marginLeft: 3,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
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
