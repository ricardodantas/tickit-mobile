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
  const addList = useStore(state => state.addList);
  const updateList = useStore(state => state.updateList);
  const deleteList = useStore(state => state.deleteList);
  const tasks = useStore(state => state.tasks);

  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

  const getTaskCount = (listId: string) => {
    return tasks.filter(t => t.list_id === listId && !t.completed).length;
  };

  const handleSelectList = (listId: string) => {
    router.push(`/list/${listId}`);
  };

  const openCreateModal = () => {
    setEditingList(null);
    setListName('');
    setListDescription('');
    setShowModal(true);
  };

  const openEditModal = (list: List) => {
    if (list.is_inbox) {
      // Can't edit inbox, just open it
      handleSelectList(list.id);
      return;
    }
    setEditingList(list);
    setListName(list.name);
    setListDescription(list.description || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingList(null);
    setListName('');
    setListDescription('');
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
          onPress: () => {
            deleteList(list.id);
            closeModal();
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!listName.trim()) return;
    
    if (editingList) {
      await updateList({
        ...editingList,
        name: listName.trim(),
        description: listDescription.trim() || null,
      });
    } else {
      await addList({
        name: listName.trim(),
        description: listDescription.trim() || null,
        icon: '📁',
        color: null,
        sort_order: lists.length,
      });
    }
    
    closeModal();
  };

  const renderListItem = ({ item }: { item: List }) => {
    const taskCount = getTaskCount(item.id);
    
    return (
      <View style={[styles.listItem, { backgroundColor: colors.backgroundSecondary }]}>
        <Pressable 
          style={styles.listItemContent}
          onPress={() => handleSelectList(item.id)}
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
        </Pressable>
        
        {!item.is_inbox && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Feather name="more-horizontal" size={20} color={colors.comment} />
          </TouchableOpacity>
        )}
        
        <Pressable 
          style={styles.chevronButton}
          onPress={() => handleSelectList(item.id)}
        >
          <Feather name="chevron-right" size={16} color={colors.comment} />
        </Pressable>
      </View>
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
        onPress={openCreateModal}
      >
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={[styles.addButtonText, { color: colors.purple }]}>New List</Text>
      </TouchableOpacity>

      {/* Create/Edit List Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.backgroundTertiary }]}>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {editingList ? 'Edit List' : 'New List'}
              </Text>
              <TouchableOpacity 
                onPress={handleSave}
                disabled={!listName.trim()}
              >
                <Feather 
                  name="check" 
                  size={24} 
                  color={listName.trim() ? colors.purple : colors.comment} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="folder" size={18} color={colors.comment} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={listName}
                  onChangeText={setListName}
                  placeholder="List name"
                  placeholderTextColor={colors.comment}
                  autoFocus
                />
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="align-left" size={18} color={colors.comment} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={listDescription}
                  onChangeText={setListDescription}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.comment}
                />
              </View>

              {/* Delete button (only for editing, not inbox) */}
              {editingList && !editingList.is_inbox && (
                <TouchableOpacity 
                  style={[styles.deleteButton, { borderColor: colors.red }]}
                  onPress={() => handleDelete(editingList)}
                >
                  <Feather name="trash-2" size={18} color={colors.red} />
                  <Text style={[styles.deleteButtonText, { color: colors.red }]}>Delete List</Text>
                </TouchableOpacity>
              )}
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
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  listItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
  },
  taskCountText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  editButton: {
    padding: spacing.md,
  },
  chevronButton: {
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
