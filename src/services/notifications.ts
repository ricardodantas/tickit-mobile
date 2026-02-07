// Notification service for due date reminders

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function scheduleTaskReminder(task: Task): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (!task.due_date || task.completed) return null;
  
  // Cancel any existing notification for this task
  await cancelTaskReminder(task.id);
  
  const dueDate = new Date(task.due_date);
  const now = new Date();
  
  // Set reminder for 9:00 AM on the due date
  dueDate.setHours(9, 0, 0, 0);
  
  // If the due date is in the past, don't schedule
  if (dueDate <= now) return null;
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Task Due Today',
      body: task.title,
      data: { taskId: task.id },
      sound: true,
      priority: getPriorityLevel(task.priority),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dueDate,
    },
    identifier: `task-${task.id}`,
  });
  
  return identifier;
}

export async function scheduleTaskReminderAdvance(task: Task, hoursBefore: number = 24): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (!task.due_date || task.completed) return null;
  
  const dueDate = new Date(task.due_date);
  const reminderDate = new Date(dueDate.getTime() - hoursBefore * 60 * 60 * 1000);
  const now = new Date();
  
  // If the reminder time is in the past, don't schedule
  if (reminderDate <= now) return null;
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Task Due Tomorrow',
      body: task.title,
      data: { taskId: task.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
    identifier: `task-advance-${task.id}`,
  });
  
  return identifier;
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
    await Notifications.cancelScheduledNotificationAsync(`task-advance-${taskId}`);
  } catch (e) {
    // Notification may not exist, ignore
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') return [];
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function syncAllReminders(tasks: Task[]): Promise<void> {
  if (Platform.OS === 'web') return;
  
  // Cancel all existing reminders
  await cancelAllReminders();
  
  // Schedule reminders for all tasks with due dates
  for (const task of tasks) {
    if (task.due_date && !task.completed) {
      await scheduleTaskReminder(task);
      // Also schedule day-before reminder for high/urgent tasks
      if (task.priority === 'high' || task.priority === 'urgent') {
        await scheduleTaskReminderAdvance(task, 24);
      }
    }
  }
}

function getPriorityLevel(priority: string): Notifications.AndroidNotificationPriority {
  switch (priority) {
    case 'urgent':
      return Notifications.AndroidNotificationPriority.MAX;
    case 'high':
      return Notifications.AndroidNotificationPriority.HIGH;
    case 'medium':
      return Notifications.AndroidNotificationPriority.DEFAULT;
    case 'low':
      return Notifications.AndroidNotificationPriority.LOW;
    default:
      return Notifications.AndroidNotificationPriority.DEFAULT;
  }
}

// Listen for notification responses (when user taps notification)
export function addNotificationResponseListener(
  callback: (taskId: string) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const taskId = response.notification.request.content.data?.taskId;
    if (taskId) {
      callback(taskId as string);
    }
  });
}
