// Lists screen

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
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
            <Text style={styles.listIcon}>{item.icon}</Text>
            <View style={styles.listContent}>
              <Text style={styles.listName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.listDescription}>{item.description}</Text>
              )}
            </View>
            <View style={styles.taskCount}>
              <Text style={styles.taskCountText}>{getTaskCount(item.id)}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Add list button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ New List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    gap: spacing.md,
  },
  listItemSelected: {
    borderColor: colors.purple,
    borderWidth: 2,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  listIcon: {
    fontSize: 24,
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
  },
  taskCountText: {
    fontSize: fontSize.sm,
    color: colors.comment,
    fontWeight: '600',
  },
  addButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: fontSize.md,
    color: colors.purple,
    fontWeight: '600',
  },
});
