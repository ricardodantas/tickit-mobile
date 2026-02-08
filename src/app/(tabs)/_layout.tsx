// Tab layout with bottom navigation

import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.comment,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.backgroundTertiary,
          borderTopWidth: 0.5,
        },
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
        },
        headerTintColor: colors.foreground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name={focused ? 'check-circle' : 'circle'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ color }) => (
            <Feather name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: ({ color }) => (
            <Feather name="tag" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
