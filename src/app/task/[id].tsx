// Task detail/edit screen

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const tags = useStore(state => state.tags);
  const updateTask = useStore(state => state.updateTask);
  const deleteTask = useStore(state => state.deleteTask);
  const toggleTask = useStore(state => state.toggleTask);

  const task = tasks.find(t => t.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

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
      setDueDate(task.due_date ? new Date(task.due_date) : null);
      setSelectedTagIds(task.tag_ids || []);
    }
  }, [task]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={[styles.notFound, { color: colors.comment }]}>Task not found</Text>
      </SafeAreaView>
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
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
      tag_ids: selectedTagIds,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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

      <ScrollView style={styles.scrollView}>
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

          {/* Due Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.comment }]}>Due Date</Text>
            <TouchableOpacity 
              style={[styles.dateButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={18} color={colors.comment} />
              <Text style={[styles.dateText, { color: dueDate ? colors.foreground : colors.comment }]}>
                {dueDate ? formatDate(dueDate) : 'Select due date'}
              </Text>
              {dueDate && (
                <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDate}>
                  <Feather name="x" size={16} color={colors.comment} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  themeVariant="dark"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={[styles.datePickerDone, { backgroundColor: colors.purple }]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.comment }]}>Tags</Text>
              <View style={styles.tagsRow}>
                {tags.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagButton,
                        { backgroundColor: colors.backgroundSecondary, borderColor: colors.backgroundTertiary },
                        isSelected && { borderColor: tag.color, backgroundColor: colors.backgroundTertiary },
                      ]}
                      onPress={() => toggleTag(tag.id)}
                    >
                      <View style={[styles.tagDot, { backgroundColor: tag.color }]} />
                      <Text style={[
                        styles.tagText,
                        { color: colors.comment },
                        isSelected && { color: colors.foreground },
                      ]}>
                        {tag.name}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={14} color={tag.color} style={styles.tagCheck} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  dateText: {
    fontSize: fontSize.md,
    marginLeft: spacing.md,
    flex: 1,
  },
  clearDate: {
    padding: spacing.xs,
  },
  datePickerContainer: {
    marginTop: spacing.sm,
  },
  datePickerDone: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  datePickerDoneText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: fontSize.md,
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  tagText: {
    fontSize: fontSize.sm,
  },
  tagCheck: {
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
