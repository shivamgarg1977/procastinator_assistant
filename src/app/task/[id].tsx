import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Confetti } from '@/components/Confetti';
import { getActiveTask, addCompletedTask, clearActiveTask, ActiveTask } from '@/utils/storage';
import { Spacing, TopTabInset } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const maxContentWidth = 600;

export default function TaskTimerScreen() {
  const { id } = useLocalSearchParams();
  
  const [task, setTask] = useState<ActiveTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const totalSeconds = useRef(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    async function loadTask() {
      const activeTask = await getActiveTask();
      if (!activeTask) {
        // Fallback or go back
        router.replace('/');
        return;
      }
      setTask(activeTask);
      const seconds = activeTask.duration * 60;
      setTimeLeft(seconds);
      totalSeconds.current = seconds;
      setCompletedSteps(new Array(activeTask.steps.length).fill(false));
      setLoading(false);
    }
    loadTask();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !loading && !isFinished) {
      handleComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, loading]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleStepToggle = (index: number) => {
    const updated = [...completedSteps];
    updated[index] = !updated[index];
    setCompletedSteps(updated);
  };

  const handleComplete = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    
    if (task) {
      try {
        await addCompletedTask({
          title: task.title,
          description: task.description,
          category: task.category,
          duration: task.duration,
          energy: task.energy,
          avoidedTask: task.avoidedTask,
          xpEarned: task.duration * 10,
        });
      } catch (e) {
        console.error('Failed to log completed task', e);
      }
    }
    
    setIsFinished(true);
  };

  const handleExit = async () => {
    await clearActiveTask();
    router.replace('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !task) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading timer...</ThemedText>
      </ThemedView>
    );
  }

  // Circular progress math
  const radius = 90;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds.current > 0 ? timeLeft / totalSeconds.current : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {isFinished && <Confetti />}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header context */}
          <View style={styles.header}>
            <ThemedText type="smallBold" style={styles.avoidHeader}>
              PRODUCTIVE AVERSION IN PROGRESS
            </ThemedText>
            <ThemedText style={styles.avoidText}>
              Instead of: <ThemedText type="smallBold">"{task.avoidedTask}"</ThemedText>
            </ThemedText>
          </View>

          {/* Main Workspace Card */}
          <ThemedView type="backgroundElement" style={styles.timerCard}>
            <ThemedText type="subtitle" style={styles.taskTitle}>
              {task.title}
            </ThemedText>
            <ThemedText style={styles.taskDesc}>{task.description}</ThemedText>

            {/* SVG Circular Timer */}
            <View style={styles.timerContainer}>
              <Svg width={radius * 2 + stroke * 2} height={radius * 2 + stroke * 2} style={styles.svg}>
                {/* Background track circle */}
                <Circle
                  cx={radius + stroke}
                  cy={radius + stroke}
                  r={radius}
                  stroke="rgba(128, 128, 128, 0.1)"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                {/* Foreground animated progress circle */}
                <Circle
                  cx={radius + stroke}
                  cy={radius + stroke}
                  r={radius}
                  stroke={isFinished ? '#10B981' : '#6366F1'} // green if done, indigo if active
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
                />
              </Svg>
              <View style={styles.timeLabelContainer}>
                <ThemedText style={styles.timerText}>
                  {isFinished ? 'Done!' : formatTime(timeLeft)}
                </ThemedText>
                <ThemedText type="small" style={styles.timerSubText}>
                  {isFinished ? 'Awesome job' : isActive ? 'Stay focused' : 'Paused'}
                </ThemedText>
              </View>
            </View>

            {/* Timer Controls */}
            {!isFinished && (
              <View style={styles.controlsRow}>
                <Pressable
                  onPress={toggleTimer}
                  style={({ pressed }) => [
                    styles.controlButton,
                    { backgroundColor: isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)' },
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                >
                  <ThemedText style={[styles.controlButtonText, { color: isActive ? '#EF4444' : '#6366F1' }]}>
                    {isActive ? 'Pause' : 'Resume'}
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={handleComplete}
                  style={({ pressed }) => [
                    styles.controlButton,
                    styles.completeButton,
                    { opacity: pressed ? 0.8 : 1 }
                  ]}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Finish Early
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </ThemedView>

          {/* Checklists and Tips */}
          {!isFinished ? (
            <View style={styles.detailsContainer}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Action Plan ({completedSteps.filter(Boolean).length}/{task.steps.length})
              </ThemedText>
              <View style={styles.stepsList}>
                {task.steps.map((step, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleStepToggle(idx)}
                    style={styles.stepItem}
                  >
                    <View style={[
                      styles.checkbox,
                      completedSteps[idx] && styles.checkboxChecked
                    ]}>
                      {completedSteps[idx] && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                    </View>
                    <ThemedText style={[
                      styles.stepText,
                      completedSteps[idx] && styles.stepTextCompleted
                    ]}>
                      {step}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Focus Tips
              </ThemedText>
              <View style={styles.tipsList}>
                {task.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <ThemedText style={styles.tipDot}>💡</ThemedText>
                    <ThemedText style={styles.tipText}>{tip}</ThemedText>
                  </View>
                ))}
              </View>
              
              <Pressable
                onPress={handleExit}
                style={({ pressed }) => [
                  styles.giveUpButton,
                  { opacity: pressed ? 0.6 : 1 }
                ]}
              >
                <ThemedText style={styles.giveUpText}>
                  Cancel / Give Up
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            // Celebration screen
            <ThemedView type="backgroundElement" style={styles.celebrationCard}>
              <ThemedText style={styles.celebrationEmoji}>🎉</ThemedText>
              <ThemedText type="subtitle" style={styles.celebrationTitle}>
                Procrastination Productive!
              </ThemedText>
              <ThemedText style={styles.celebrationDesc}>
                You turned {task.duration} minutes of avoidance into something amazing. You've earned:
              </ThemedText>
              <ThemedText style={styles.xpTotal}>
                +{task.duration * 10} XP
              </ThemedText>
              <Pressable
                onPress={handleExit}
                style={({ pressed }) => [
                  styles.exitButton,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <ThemedText style={styles.exitButtonText}>
                  Back to Dashboard
                </ThemedText>
              </Pressable>
            </ThemedView>
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
    maxWidth: maxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: TopTabInset + Spacing.four,
    paddingBottom: Spacing.five,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  avoidHeader: {
    color: '#8A8D93',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: Spacing.one,
  },
  avoidText: {
    fontSize: 14,
    opacity: 0.8,
  },
  timerCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  taskDesc: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  timerContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.three,
  },
  svg: {
    position: 'absolute',
  },
  timeLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timerSubText: {
    color: '#8A8D93',
    marginTop: Spacing.one,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
  controlButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  completeButton: {
    backgroundColor: '#10B981', // green
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsContainer: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  stepsList: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  tipsList: {
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  tipDot: {
    fontSize: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  giveUpButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  giveUpText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  celebrationCard: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  celebrationEmoji: {
    fontSize: 50,
    marginBottom: Spacing.three,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#10B981',
    marginBottom: Spacing.two,
  },
  celebrationDesc: {
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.three,
  },
  xpTotal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: Spacing.five,
  },
  exitButton: {
    backgroundColor: '#10B981',
    alignSelf: 'stretch',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  exitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
