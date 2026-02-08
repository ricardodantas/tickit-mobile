// Shared screen wrapper with safe area handling

import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fontSize } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

interface ScreenWrapperProps {
  children: React.ReactNode;
  header?: ScreenHeaderProps;
  style?: ViewStyle;
}

export function ScreenWrapper({ children, header, style }: ScreenWrapperProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }, style]} 
      edges={['top']}
    >
      {header && (
        <View style={[styles.header, { borderBottomColor: colors.backgroundTertiary }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.foreground }]}>{header.title}</Text>
            {header.subtitle && (
              <Text style={[styles.subtitle, { color: colors.comment }]}>{header.subtitle}</Text>
            )}
          </View>
          {header.rightContent && (
            <View style={styles.headerRight}>
              {header.rightContent}
            </View>
          )}
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
