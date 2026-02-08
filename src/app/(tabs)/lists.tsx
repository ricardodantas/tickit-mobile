// Lists screen

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { colors, spacing, borderRadius, fontSize } from '../../theme';
import { List } from '../../types';

export default function ListsScreen() {
  const lists = useStore(state => state.lists);
  const selectedListId = useStore(state => state.selectedListId);
  const selectList = useStore(state => state.selectList);
  const deleteList = useStore(state => state.deleteList);
  const tasks = useStore(state => state.tasks);

  const getTaskCount = (listId: string) => {
    return tasks.filter(t => t.list_id === listId && !t.completed).length;
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Lists</Text>
          <Text style={styles.subtitle}>
            {lists.length} {lists.length === 1 ? 'list' : 'lists'}
          </Text>
        </View>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [
              styles.listItem,
              item.id === selectedListId && styles.listItemSelected,
              pressed && styles.listItemPressed,
            ]}
            onPress={() => selectList(item.id)}
            onLongPress={() => handleDelete(item)}
          >
            <View style={styles.iconContainer}>
              <Feather 
                name={item.is_inbox ? 'inbox' : 'folder'} 
                size={20} 
                color={colors.purple} 
              />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.listDescription}>{item.description}</Text>
              )}
            </View>
            <View style={styles.taskCount}>
              <Text style={styles.taskCountText}>{getTaskCount(item.id)}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.comment} />
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Feather name="folder" size={32} color={colors.comment} />
            </View>
            <Text style={styles.emptyText}>No lists yet</Text>
            <Text style={styles.emptySubtext}>Create lists to organize tasks</Text>
          </View>
        }
      />

      {/* Add list button */}
      <TouchableOpacity style={styles.addButton}>
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={styles.addButtonText}>New List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.comment,
    marginTop: 2,
  },
  list: {
    padding: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  listItemSelected: {
    borderColor: colors.purple,
    borderWidth: 2,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.backgroundTertiary,
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
    color: colors.foreground,
  },
  listDescription: {
    fontSize: fontSize.sm,
    color: colors.comment,
    marginTop: 2,
  },
  taskCount: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  taskCountText: {
    fontSize: fontSize.sm,
    color: colors.comment,
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
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.foreground,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.comment,
    marginTop: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    fontSize: fontSize.md,
    color: colors.purple,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
