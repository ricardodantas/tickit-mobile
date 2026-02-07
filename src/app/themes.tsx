// Theme picker screen

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
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
      <Text style={[styles.title, { color: colors.foreground }]}>Choose Theme</Text>
      <Text style={[styles.subtitle, { color: colors.comment }]}>
        15 beautiful themes to personalize your experience
      </Text>

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
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  themeCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
  selectedText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
