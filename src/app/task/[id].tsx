// Task detail/edit screen

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store';
import { colors, spacing, borderRadius, fontSize } from '../../theme';
import { Priority, Task } from '../../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tasks = useStore(state => state.tasks);
  const lists = useStore(state => state.lists);
  const updateTask = useStore(state => state.updateTask);
  const deleteTask = useStore(state => state.deleteTask);
  const toggleTask = useStore(state => state.toggleTask);

  const task = tasks.find(t => t.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setListId(task.list_id);
      setDueDate(task.due_date || '');
    }
  }, [task]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Task not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) return;

    await updateTask({
      ...task,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      list_id: listId,
      due_date: dueDate || null,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleToggle = async () => {
    await toggleTask(task.id);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Completed toggle */}
      <TouchableOpacity 
        style={[styles.completeButton, task.completed && styles.completeButtonDone]}
        onPress={handleToggle}
      >
        <Text style={styles.completeButtonText}>
          {task.completed ? '✓ Completed' : '○ Mark Complete'}
        </Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.comment}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add details..."
          placeholderTextColor={colors.comment}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Priority */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton,
                priority === p && styles.priorityButtonSelected,
                { borderColor: getPriorityColor(p) },
              ]}
              onPress={() => setPriority(p)}
            >
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
              <Text style={[
                styles.priorityText,
                priority === p && { color: getPriorityColor(p) },
              ]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <View style={styles.field}>
        <Text style={styles.label}>List</Text>
        <View style={styles.listRow}>
          {lists.map(list => (
            <TouchableOpacity
              key={list.id}
              style={[
                styles.listButton,
                listId === list.id && styles.listButtonSelected,
              ]}
              onPress={() => setListId(list.id)}
            >
              <Text style={styles.listIcon}>{list.icon}</Text>
              <Text style={[
                styles.listText,
                listId === list.id && styles.listTextSelected,
              ]}>
                {list.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Due Date */}
      <View style={styles.field}>
        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.comment}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!title.trim()}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  notFound: {
    fontSize: fontSize.lg,
    color: colors.comment,
    textAlign: 'center',
    marginTop: 100,
  },
  completeButton: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.backgroundTertiary,
  },
  completeButtonDone: {
    borderColor: colors.green,
    backgroundColor: colors.backgroundTertiary,
  },
  completeButtonText: {
    fontSize: fontSize.md,
    color: colors.foreground,
    fontWeight: '500',
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.comment,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.backgroundTertiary,
  },
  priorityButtonSelected: {
    backgroundColor: colors.backgroundTertiary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: fontSize.sm,
    color: colors.comment,
    fontWeight: '500',
  },
  listRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.backgroundTertiary,
  },
  listButtonSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.backgroundTertiary,
  },
  listIcon: {
    fontSize: 16,
  },
  listText: {
    fontSize: fontSize.sm,
    color: colors.comment,
  },
  listTextSelected: {
    color: colors.foreground,
  },
  saveButton: {
    backgroundColor: colors.purple,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
  },
  deleteButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.red,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.red,
  },
});
