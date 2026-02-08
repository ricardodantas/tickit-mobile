// New task screen

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Priority } from '../../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export default function NewTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const lists = useStore(state => state.lists);
  const selectedListId = useStore(state => state.selectedListId);
  const addTask = useStore(state => state.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState(selectedListId || lists.find(l => l.is_inbox)?.id || '');
  const [dueDate, setDueDate] = useState('');

  const getPriorityColor = (p: Priority): string => {
    switch (p) {
      case 'urgent': return colors.red;
      case 'high': return colors.orange;
      case 'medium': return colors.cyan;
      case 'low': return colors.comment;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      description: description.trim() || null,
      url: null,
      priority,
      completed: false,
      list_id: listId,
      due_date: dueDate || null,
    });

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>New Task</Text>
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
              autoFocus
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
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Create Task</Text>
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
  title: {
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
});
