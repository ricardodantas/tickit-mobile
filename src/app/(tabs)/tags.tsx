// Tags screen

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { useStore } from '../../store';
import { colors, spacing, borderRadius, fontSize } from '../../theme';
import { Tag } from '../../types';

export default function TagsScreen() {
  const tags = useStore(state => state.tags);
  const deleteTag = useStore(state => state.deleteTag);
  const tasks = useStore(state => state.tasks);

  const handleDelete = (tag: Tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTag(tag.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [
              styles.tagItem,
              pressed && styles.tagItemPressed,
            ]}
            onLongPress={() => handleDelete(item)}
          >
            <View style={[styles.tagColor, { backgroundColor: item.color }]} />
            <Text style={styles.tagName}>{item.name}</Text>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.emptyText}>No tags yet</Text>
            <Text style={styles.emptySubtext}>Create tags to organize your tasks</Text>
          </View>
        }
      />

      {/* Add tag button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ New Tag</Text>
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
  tagItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    margin: spacing.xs,
    gap: spacing.sm,
  },
  tagItemPressed: {
    opacity: 0.7,
  },
  tagColor: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.sm,
  },
  tagName: {
    fontSize: fontSize.md,
    color: colors.foreground,
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.foreground,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.comment,
    marginTop: spacing.xs,
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
