// Tab layout with bottom navigation

import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const TabIcon = ({ name, color }: { name: keyof typeof Feather.glyphMap; color: string }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={name} size={22} color={color} />
    </View>
  );

  const tabBarHeight = 50;
  const totalHeight = tabBarHeight + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.comment,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.backgroundTertiary,
          height: totalHeight,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: {
          height: tabBarHeight,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => (
            <TabIcon name="inbox" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ color }) => <TabIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: ({ color }) => <TabIcon name="tag" color={color} />,
        }}
      />
    </Tabs>
  );
}
