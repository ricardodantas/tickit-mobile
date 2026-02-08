// Theme picker screen

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { themeList, getColors } from '../theme';
import { spacing, borderRadius, fontSize } from '../theme';

export default function ThemesScreen() {
  const router = useRouter();
  const { theme: currentTheme, setTheme, colors } = useTheme();

  const handleSelectTheme = async (themeName: string) => {
    await setTheme(themeName);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.foreground }]}>Themes</Text>
          <Text style={[styles.subtitle, { color: colors.comment }]}>
            15 beautiful themes
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.grid}>
          {themeList.map((theme) => {
            const themeColors = getColors(theme.palette);
            const isSelected = theme.name === currentTheme.name;

            return (
              <TouchableOpacity
                key={theme.name}
                style={[
                  styles.themeCard,
                  { backgroundColor: theme.palette.background },
                  isSelected && { borderColor: colors.purple, borderWidth: 3 },
                ]}
                onPress={() => handleSelectTheme(theme.name)}
                activeOpacity={0.7}
              >
                {/* Color preview */}
                <View style={styles.colorRow}>
                  <View style={[styles.colorDot, { backgroundColor: theme.palette.red }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.palette.orange }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.palette.yellow }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.palette.green }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.palette.cyan }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.palette.purple }]} />
                </View>

                {/* Theme name */}
                <Text style={[styles.themeName, { color: theme.palette.foreground }]}>
                  {theme.displayName}
                </Text>

                {/* Sample text */}
                <Text style={[styles.sampleText, { color: theme.palette.comment }]}>
                  Sample text
                </Text>

                {/* Selected indicator */}
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.purple }]}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 16,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    marginBottom: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  themeName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  sampleText: {
    fontSize: fontSize.sm,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
