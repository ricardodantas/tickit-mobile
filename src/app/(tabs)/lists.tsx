// Lists screen

import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components';
import { spacing, borderRadius, fontSize } from '../../theme';
import { List } from '../../types';

export default function ListsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const lists = useStore(state => state.lists);
  const selectedListId = useStore(state => state.selectedListId);
  const selectList = useStore(state => state.selectList);
  const addList = useStore(state => state.addList);
  const deleteList = useStore(state => state.deleteList);
  const tasks = useStore(state => state.tasks);

  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const getTaskCount = (listId: string) => {
    return tasks.filter(t => t.list_id === listId && !t.completed).length;
  };

  const handleSelectList = (listId: string) => {
    selectList(listId);
    // Navigate to the Tasks tab with this list selected
    router.push('/(tabs)');
  };

  const handleDelete = (list: List) => {
    if (list.is_inbox) return;
    
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? Tasks will be moved to Inbox.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteList(list.id),
        },
      ]
    );
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    await addList({
      name: newListName.trim(),
      description: newListDescription.trim() || null,
      emoji: '📁',
      parent_id: null,
      sort_order: lists.length,
    });
    
    setNewListName('');
    setNewListDescription('');
    setShowModal(false);
  };

  const renderListItem = ({ item }: { item: List }) => {
    const isSelected = item.id === selectedListId;
    const taskCount = getTaskCount(item.id);
    
    return (
      <Pressable 
        style={[
          styles.listItem,
          { backgroundColor: colors.backgroundSecondary },
          isSelected && { borderColor: colors.purple, borderWidth: 2 },
        ]}
        onPress={() => handleSelectList(item.id)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <Feather 
            name={item.is_inbox ? 'inbox' : 'folder'} 
            size={20} 
            color={colors.purple} 
          />
        </View>
        <View style={styles.listContent}>
          <Text style={[styles.listName, { color: colors.foreground }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.listDescription, { color: colors.comment }]} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={[styles.taskCount, { backgroundColor: colors.backgroundTertiary }]}>
          <Text style={[styles.taskCountText, { color: colors.comment }]}>{taskCount}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.comment} />
      </Pressable>
    );
  };

  return (
    <ScreenWrapper
      header={{
        title: 'Lists',
        subtitle: `${lists.length} ${lists.length === 1 ? 'list' : 'lists'}`,
      }}
    >
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Feather name="folder" size={32} color={colors.comment} />
            </View>
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No lists yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.comment }]}>Create lists to organize tasks</Text>
          </View>
        }
      />

      {/* Add list button */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={() => setShowModal(true)}
      >
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={[styles.addButtonText, { color: colors.purple }]}>New List</Text>
      </TouchableOpacity>

      {/* Create List Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.backgroundTertiary }]}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>New List</Text>
              <TouchableOpacity 
                onPress={handleCreateList}
                disabled={!newListName.trim()}
              >
                <Feather 
                  name="check" 
                  size={24} 
                  color={newListName.trim() ? colors.purple : colors.comment} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="folder" size={18} color={colors.comment} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={newListName}
                  onChangeText={setNewListName}
                  placeholder="List name"
                  placeholderTextColor={colors.comment}
                  autoFocus
                />
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="align-left" size={18} color={colors.comment} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={newListDescription}
                  onChangeText={setNewListDescription}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.comment}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  listDescription: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  taskCount: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  taskCountText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  modalBody: {
    padding: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
  },
});
