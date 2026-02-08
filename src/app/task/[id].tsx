// Task detail/edit screen

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Priority } from '../../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
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

  const getPriorityColor = (p: Priority): string => {
    switch (p) {
      case 'urgent': return colors.red;
      case 'high': return colors.orange;
      case 'medium': return colors.cyan;
      case 'low': return colors.comment;
    }
  };

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.comment }]}>Task not found</Text>
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Task</Text>
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
          style={[
            styles.completeButton, 
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.backgroundTertiary },
            task.completed && { borderColor: colors.green, backgroundColor: colors.backgroundTertiary }
          ]}
          onPress={handleToggle}
        >
          <Feather 
            name={task.completed ? 'check-circle' : 'circle'} 
            size={20} 
            color={task.completed ? colors.green : colors.comment} 
          />
          <Text style={[styles.completeButtonText, { color: colors.foreground }, task.completed && { color: colors.green }]}>
            {task.completed ? 'Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.field}>
          <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
            <Feather name="edit-3" size={18} color={colors.comment} style={styles.inputIcon} />
            <TextInput
              style={[styles.titleInput, { color: colors.foreground }]}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.comment}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
            <Feather name="align-left" size={18} color={colors.comment} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.foreground }]}
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
          <Text style={[styles.label, { color: colors.comment }]}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.backgroundTertiary },
                  priority === p && { backgroundColor: colors.backgroundTertiary, borderColor: getPriorityColor(p) },
                ]}
                onPress={() => setPriority(p)}
              >
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                <Text style={[
                  styles.priorityText,
                  { color: colors.comment },
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
          <Text style={[styles.label, { color: colors.comment }]}>List</Text>
          <View style={styles.listRow}>
            {lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[
                  styles.listButton,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.backgroundTertiary },
                  listId === list.id && { borderColor: colors.purple, backgroundColor: colors.backgroundTertiary },
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
                  { color: colors.comment },
                  listId === list.id && { color: colors.foreground },
                ]}>
                  {list.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.field}>
          <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
            <Feather name="calendar" size={18} color={colors.comment} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={colors.comment}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.purple }, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity style={[styles.deleteButton, { borderColor: colors.red }]} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color={colors.red} />
          <Text style={[styles.deleteButtonText, { color: colors.red }]}>Delete Task</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
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
    textAlign: 'center',
    marginTop: 100,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  completeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
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
    borderWidth: 2,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  priorityText: {
    fontSize: fontSize.sm,
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
    borderWidth: 2,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  listText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
