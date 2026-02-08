// Tab layout with bottom navigation

import { Platform } from 'react-native';
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
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.backgroundTertiary,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: '600',
        },
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
