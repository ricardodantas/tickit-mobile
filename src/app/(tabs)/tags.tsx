// Tags screen

import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Pressable, Alert, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components';
import { spacing, borderRadius, fontSize } from '../../theme';
import { Tag } from '../../types';

const TAG_COLORS = [
  '#ff5555', '#ff79c6', '#ffb86c', '#f1fa8c', 
  '#50fa7b', '#8be9fd', '#bd93f9', '#6272a4',
];

export default function TagsScreen() {
  const { colors } = useTheme();
  const tags = useStore(state => state.tags);
  const addTag = useStore(state => state.addTag);
  const deleteTag = useStore(state => state.deleteTag);

  const [showModal, setShowModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

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

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    await addTag({
      name: newTagName.trim(),
      color: selectedColor,
    });
    
    setNewTagName('');
    setSelectedColor(TAG_COLORS[0]);
    setShowModal(false);
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
    <ScreenWrapper
      header={{
        title: 'Tags',
        subtitle: `${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}`,
      }}
    >
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
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={() => setShowModal(true)}
      >
        <Feather name="plus" size={20} color={colors.purple} />
        <Text style={[styles.addButtonText, { color: colors.purple }]}>New Tag</Text>
      </TouchableOpacity>

      {/* Create Tag Modal */}
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
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Tag</Text>
              <TouchableOpacity 
                onPress={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                <Feather 
                  name="check" 
                  size={24} 
                  color={newTagName.trim() ? colors.purple : colors.comment} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.inputRow, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={newTagName}
                  onChangeText={setNewTagName}
                  placeholder="Tag name"
                  placeholderTextColor={colors.comment}
                  autoFocus
                />
              </View>

              <Text style={[styles.label, { color: colors.comment }]}>Color</Text>
              <View style={styles.colorGrid}>
                {TAG_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Feather name="check" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
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
    marginBottom: spacing.lg,
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
});
