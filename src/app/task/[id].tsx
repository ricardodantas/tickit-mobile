// Task detail/edit screen

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Task</Text>
        </View>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveHeaderButton, !title.trim() && styles.saveHeaderButtonDisabled]}
          disabled={!title.trim()}
        >
          <Feather name="check" size={24} color={title.trim() ? colors.purple : colors.comment} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Completed toggle */}
        <TouchableOpacity 
          style={[styles.completeButton, task.completed && styles.completeButtonDone]}
          onPress={handleToggle}
        >
          <Feather 
            name={task.completed ? 'check-circle' : 'circle'} 
            size={20} 
            color={task.completed ? colors.green : colors.comment} 
          />
          <Text style={[styles.completeButtonText, task.completed && { color: colors.green }]}>
            {task.completed ? 'Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.field}>
          <View style={styles.inputRow}>
            <Feather name="edit-3" size={18} color={colors.comment} style={styles.inputIcon} />
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.comment}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <View style={styles.inputRow}>
            <Feather name="align-left" size={18} color={colors.comment} style={styles.inputIcon} />
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
                  priority === p && { borderColor: getPriorityColor(p) },
                ]}
                onPress={() => setPriority(p)}
              >
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                <Text style={[
                  styles.priorityText,
                  priority === p && { color: colors.foreground },
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
                <Feather 
                  name={list.is_inbox ? 'inbox' : 'folder'} 
                  size={16} 
                  color={listId === list.id ? colors.purple : colors.comment} 
                />
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
          <View style={styles.inputRow}>
            <Feather name="calendar" size={18} color={colors.comment} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={colors.comment}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color={colors.red} />
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
  },
  saveHeaderButton: {
    padding: spacing.sm,
  },
  saveHeaderButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    padding: spacing.md,
  },
  notFound: {
    fontSize: fontSize.lg,
    color: colors.comment,
    textAlign: 'center',
    marginTop: 100,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
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
    marginLeft: spacing.sm,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.comment,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  titleInput: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.foreground,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.backgroundTertiary,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  priorityButtonSelected: {
    backgroundColor: colors.backgroundTertiary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  priorityText: {
    fontSize: fontSize.sm,
    color: colors.comment,
    fontWeight: '500',
  },
  listRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.backgroundTertiary,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  listButtonSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.backgroundTertiary,
  },
  listText: {
    fontSize: fontSize.sm,
    color: colors.comment,
    marginLeft: spacing.xs,
  },
  listTextSelected: {
    color: colors.foreground,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#fff',
    marginLeft: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.red,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.red,
    marginLeft: spacing.sm,
  },
});
