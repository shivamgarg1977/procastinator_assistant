import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AvoidanceChart } from '@/components/AvoidanceChart';
import { getCompletedTasks, getStreak, Task } from '@/utils/storage';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navigation = useNavigation();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const completed = await getCompletedTasks();
      const currentStreak = await getStreak();
      setTasks(completed);
      setStreak(currentStreak);
    } catch (e) {
      console.error('Failed to load history data', e);
    } finally {
      setLoading(false);
    }
  };

  // Reload history data when screen focus changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'physical': return '🏃‍♂️';
      case 'learning': return '🧠';
      case 'admin': return '📁';
      case 'creative': return '🎨';
      case 'quick': return '⚡';
      default: return '✅';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle">Stats & History</ThemedText>
            <View style={styles.streakBadge}>
              <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
              <ThemedText type="smallBold" style={styles.streakText}>
                {streak} Day Streak
              </ThemedText>
            </View>
          </View>

          {/* Analytics Chart */}
          {loading ? (
            <ThemedView type="backgroundElement" style={styles.loaderContainer}>
              <ThemedText>Loading stats...</ThemedText>
            </ThemedView>
          ) : (
            <AvoidanceChart tasks={tasks} />
          )}

          {/* History List */}
          <ThemedText type="smallBold" style={styles.listTitle}>
            Completed Activities ({tasks.length})
          </ThemedText>

          {loading ? (
            <ThemedText style={styles.loadingText}>Loading history...</ThemedText>
          ) : tasks.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText style={styles.emptyCardText}>
                No completed items yet. When you complete an activity, it will show up here.
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.historyList}>
              {tasks.map(task => (
                <ThemedView 
                  key={task.id} 
                  type="backgroundElement" 
                  style={styles.historyItem}
                >
                  <View style={styles.historyMain}>
                    <ThemedText style={styles.categoryIcon}>
                      {getCategoryEmoji(task.category)}
                    </ThemedText>
                    <View style={styles.taskMeta}>
                      <ThemedText type="smallBold" style={styles.taskTitle}>
                        {task.title}
                      </ThemedText>
                      <ThemedText type="small" style={styles.avoidedTaskText}>
                        Instead of: "{task.avoidedTask}"
                      </ThemedText>
                      <ThemedText type="small" style={styles.dateText}>
                        {formatDate(task.completedAt)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.pointsBadge}>
                    <ThemedText type="smallBold" style={styles.durationLabel}>
                      {task.duration} min
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.pointsText}>
                      +{task.xpEarned} XP
                    </ThemedText>
                  </View>
                </ThemedView>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: TopTabInset + Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Rose tint
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: Spacing.one,
  },
  streakText: {
    color: '#EF4444',
  },
  loaderContainer: {
    height: 200,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
  listTitle: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: Spacing.four,
    opacity: 0.6,
  },
  emptyCard: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  emptyCardText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  historyList: {
    gap: Spacing.two,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.08)',
  },
  historyMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
  },
  categoryIcon: {
    fontSize: 24,
  },
  taskMeta: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
  },
  avoidedTaskText: {
    color: '#8A8D93',
    fontSize: 12,
    marginTop: 2,
  },
  dateText: {
    color: '#A0A3A8',
    fontSize: 11,
    marginTop: 2,
  },
  pointsBadge: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  durationLabel: {
    fontSize: 12,
    color: '#8A8D93',
  },
  pointsText: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 2,
  },
});
