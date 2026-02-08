// Tags screen

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { colors, spacing, borderRadius, fontSize } from '../../theme';
import { Tag } from '../../types';

export default function TagsScreen() {
  const tags = useStore(state => state.tags);
  const deleteTag = useStore(state => state.deleteTag);

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Tags</Text>
          <Text style={styles.subtitle}>
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </Text>
        </View>
      </View>

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
            <View style={styles.emptyIconContainer}>
              <Feather name="tag" size={32} color={colors.comment} />
            </View>
            <Text style={styles.emptyText}>No tags yet</Text>
            <Text style={styles.emptySubtext}>Create tags to organize your tasks</Text>
          </View>
        }
      />

      {/* Add tag button */}
      <TouchableOpacity style={styles.addButton}>
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={styles.addButtonText}>New Tag</Text>
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
  tagItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    margin: spacing.xs,
  },
  tagItemPressed: {
    opacity: 0.7,
  },
  tagColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: spacing.sm,
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
