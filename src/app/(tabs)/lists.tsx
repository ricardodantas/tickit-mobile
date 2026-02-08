// Lists screen

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../theme';
import { List } from '../../types';

export default function ListsScreen() {
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Lists</Text>
        <Text style={[styles.subtitle, { color: colors.comment }]}>
          {lists.length} {lists.length === 1 ? 'list' : 'lists'}
        </Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [
              styles.listItem,
              { backgroundColor: colors.backgroundSecondary },
              item.id === selectedListId && { borderColor: colors.purple, borderWidth: 2 },
              pressed && styles.listItemPressed,
            ]}
            onPress={() => selectList(item.id)}
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
                <Text style={[styles.listDescription, { color: colors.comment }]}>{item.description}</Text>
              )}
            </View>
            <View style={[styles.taskCount, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.taskCountText, { color: colors.comment }]}>{getTaskCount(item.id)}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.comment} />
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Add list button */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.backgroundSecondary }]}>
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={[styles.addButtonText, { color: colors.purple }]}>New List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
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
  listItemPressed: {
    opacity: 0.7,
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
});
