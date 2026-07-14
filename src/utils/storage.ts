import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'physical' | 'learning' | 'admin' | 'creative' | 'quick';
  duration: number; // in minutes
  energy: 'low' | 'medium' | 'high';
  completedAt: string; // ISO string
  avoidedTask: string;
  xpEarned: number;
}

export interface AppSettings {
  geminiApiKey: string;
  username: string;
  themePreference: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  username: 'Productive Avoider',
  themePreference: 'system',
  soundEnabled: true,
  hapticEnabled: true,
};

const KEYS = {
  API_KEY: '@procrastination:api_key',
  SETTINGS: '@procrastination:settings',
  COMPLETED_TASKS: '@procrastination:completed_tasks',
  STREAK: '@procrastination:streak',
  LAST_COMPLETED_DATE: '@procrastination:last_completed_date',
  ACTIVE_TASK: '@procrastination:active_task',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!json) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  } catch (e) {
    console.error('Failed to get settings', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export async function getCompletedTasks(): Promise<Task[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.COMPLETED_TASKS);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to get completed tasks', e);
    return [];
  }
}

export async function addCompletedTask(task: Omit<Task, 'id' | 'completedAt'>): Promise<Task> {
  try {
    const tasks = await getCompletedTasks();
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      completedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    await AsyncStorage.setItem(KEYS.COMPLETED_TASKS, JSON.stringify(tasks));
    
    // Update streak
    await updateStreak();
    
    return newTask;
  } catch (e) {
    console.error('Failed to add completed task', e);
    throw e;
  }
}

export async function getStreak(): Promise<number> {
  try {
    const streakStr = await AsyncStorage.getItem(KEYS.STREAK);
    const lastDateStr = await AsyncStorage.getItem(KEYS.LAST_COMPLETED_DATE);
    
    if (!streakStr) return 0;
    
    const streak = parseInt(streakStr, 10);
    if (!lastDateStr) return streak;
    
    const lastDate = new Date(lastDateStr);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If last completed date was more than 1 day ago (excluding today), reset streak
    if (diffDays > 1 && today.toDateString() !== lastDate.toDateString()) {
      await AsyncStorage.setItem(KEYS.STREAK, '0');
      return 0;
    }
    
    return streak;
  } catch (e) {
    console.error('Failed to get streak', e);
    return 0;
  }
}

async function updateStreak(): Promise<void> {
  try {
    const streakStr = await AsyncStorage.getItem(KEYS.STREAK);
    const lastDateStr = await AsyncStorage.getItem(KEYS.LAST_COMPLETED_DATE);
    
    const todayStr = new Date().toDateString();
    let streak = streakStr ? parseInt(streakStr, 10) : 0;
    
    if (lastDateStr === todayStr) {
      // Already completed a task today, streak remains the same
      return;
    }
    
    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        // Completed yesterday, increment streak
        streak += 1;
      } else {
        // Gap of more than 1 day, reset to 1
        streak = 1;
      }
    } else {
      // First task completed ever
      streak = 1;
    }
    
    await AsyncStorage.setItem(KEYS.STREAK, streak.toString());
    await AsyncStorage.setItem(KEYS.LAST_COMPLETED_DATE, todayStr);
  } catch (e) {
    console.error('Failed to update streak', e);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SETTINGS);
    await AsyncStorage.removeItem(KEYS.COMPLETED_TASKS);
    await AsyncStorage.removeItem(KEYS.STREAK);
    await AsyncStorage.removeItem(KEYS.LAST_COMPLETED_DATE);
    await AsyncStorage.removeItem(KEYS.ACTIVE_TASK);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
}

export interface ActiveTask {
  title: string;
  description: string;
  category: 'physical' | 'learning' | 'admin' | 'creative' | 'quick';
  duration: number;
  energy: 'low' | 'medium' | 'high';
  steps: string[];
  tips: string[];
  avoidedTask: string;
}

export async function saveActiveTask(task: ActiveTask): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ACTIVE_TASK, JSON.stringify(task));
  } catch (e) {
    console.error('Failed to save active task', e);
  }
}

export async function getActiveTask(): Promise<ActiveTask | null> {
  try {
    const json = await AsyncStorage.getItem(KEYS.ACTIVE_TASK);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Failed to get active task', e);
    return null;
  }
}

export async function clearActiveTask(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.ACTIVE_TASK);
  } catch (e) {
    console.error('Failed to clear active task', e);
  }
}
