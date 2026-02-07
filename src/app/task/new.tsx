// New task screen

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store';
import { colors, spacing, borderRadius, fontSize } from '../../theme';
import { Priority } from '../../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export default function NewTaskScreen() {
  const router = useRouter();
  const lists = useStore(state => state.lists);
  const selectedListId = useStore(state => state.selectedListId);
  const addTask = useStore(state => state.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState(selectedListId || lists.find(l => l.is_inbox)?.id || '');
  const [dueDate, setDueDate] = useState('');

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
    <ScrollView style={styles.container}>
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.comment}
          autoFocus
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
        <Text style={styles.saveButtonText}>Create Task</Text>
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
});
