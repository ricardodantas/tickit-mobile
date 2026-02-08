// List detail screen - shows tasks for a specific list

import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Task, Priority } from '../../types';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  
  const lists = useStore(state => state.lists);
  const tasks = useStore(state => state.tasks);
  const allTags = useStore(state => state.tags);
  const toggleTask = useStore(state => state.toggleTask);

  const [showCompleted, setShowCompleted] = useState(false);

  const list = lists.find(l => l.id === id);
  const listTasks = tasks.filter(t => t.list_id === id);
  const incompleteTasks = listTasks.filter(t => !t.completed);
  const completedTasks = listTasks.filter(t => t.completed);
  const displayedTasks = showCompleted ? listTasks : incompleteTasks;

  const handleToggle = async (taskId: string) => {
    await toggleTask(taskId);
  };

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

  if (!list) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.notFound, { color: colors.comment }]}>List not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{list.name}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.comment }]}>
            {incompleteTasks.length} remaining{completedTasks.length > 0 ? ` · ${completedTasks.length} done` : ''}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Feather 
            name={showCompleted ? 'eye' : 'eye-off'} 
            size={20} 
            color={showCompleted ? colors.purple : colors.comment} 
          />
        </TouchableOpacity>
      </View>

      {/* Task list */}
      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Feather name="check-circle" size={32} color={colors.green} />
            </View>
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No tasks in this list</Text>
            <Text style={[styles.emptySubtext, { color: colors.comment }]}>Add tasks and assign them to this list</Text>
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
    </SafeAreaView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  headerButton: {
    padding: spacing.sm,
  },
  notFound: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: 100,
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
