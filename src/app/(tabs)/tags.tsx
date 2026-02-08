// Tags screen

import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Tag } from '../../types';

export default function TagsScreen() {
  const { colors } = useTheme();
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

  const renderTagItem = ({ item }: { item: Tag }) => (
    <Pressable 
      style={[styles.tagItem, { backgroundColor: colors.backgroundSecondary }]}
      onLongPress={() => handleDelete(item)}
    >
      <View style={[styles.tagColor, { backgroundColor: item.color }]} />
      <Text style={[styles.tagName, { color: colors.foreground }]}>{item.name}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>Tags</Text>
          <Text style={[styles.subtitle, { color: colors.comment }]}>
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </Text>
        </View>
      </View>

      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        renderItem={renderTagItem}
        contentContainerStyle={styles.list}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Feather name="tag" size={32} color={colors.comment} />
            </View>
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No tags yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.comment }]}>Create tags to organize your tasks</Text>
          </View>
        }
      />

      {/* Add tag button */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.backgroundSecondary }]}>
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={[styles.addButtonText, { color: colors.purple }]}>New Tag</Text>
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
    paddingTop: 16,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
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
  tagItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    margin: spacing.xs,
  },
  tagColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  tagName: {
    fontSize: fontSize.md,
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
});
