import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, Platform, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TaskCard } from '@/components/TaskCard';
import { Confetti } from '@/components/Confetti';
import { getSettings, saveActiveTask, getStreak, addCompletedTask, clearActiveTask } from '@/utils/storage';
import { fetchAISuggestion } from '@/utils/geminiService';
import { Suggestion } from '@/utils/mockData';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navigation = useNavigation();

  // Input states
  const [avoidedTask, setAvoidedTask] = useState('');
  const [duration, setDuration] = useState<number>(15); // Default 15 mins
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string>('all');
  const [username, setUsername] = useState('Productive Avoider');
  const [streak, setStreak] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Flow states
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState('');

  // Active Timer states (integrated locally)
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const totalSeconds = useRef(0);
  const timerIntervalRef = useRef<any>(null);

  const loadingPhrases = [
    'Consulting the avoidance oracle...',
    'Tuning frequencies to productive displacement...',
    'Analyzing energy margins...',
    'Filtering non-stressful workflows...',
    'Generating optimal divergence path...',
  ];

  const durations = [5, 15, 30, 60];
  const energyLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const categories = [
    { value: 'all', label: 'All', emoji: '✨' },
    { value: 'physical', label: 'Physical', emoji: '🏃‍♂️' },
    { value: 'learning', label: 'Learning', emoji: '🧠' },
    { value: 'admin', label: 'Admin', emoji: '📁' },
    { value: 'creative', label: 'Creative', emoji: '🎨' },
  ];

  const loadProfile = async () => {
    const settings = await getSettings();
    if (settings.username) {
      setUsername(settings.username);
    }
    setHasApiKey(!!settings.geminiApiKey && settings.geminiApiKey.trim() !== '');
    const currentStreak = await getStreak();
    setStreak(currentStreak);
  };

  useEffect(() => {
    loadProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  // Integrated Timer tick effect
  useEffect(() => {
    if (showTimer && isTimerActive && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (showTimer && timeLeft === 0 && !isFinished) {
      handleCompleteTimer();
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [showTimer, isTimerActive, timeLeft, isFinished]);

  const handleGetSuggestion = async () => {
    if (!avoidedTask.trim()) {
      alert('Please tell us what task you are avoiding first!');
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    // Dynamic phrase cycle
    let phraseIndex = 0;
    setLoadingPhrase(loadingPhrases[0]);
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      setLoadingPhrase(loadingPhrases[phraseIndex]);
    }, 1500);

    try {
      const result = await fetchAISuggestion(
        avoidedTask,
        duration,
        energy,
        category
      );
      setSuggestion(result);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(phraseInterval);
      setIsLoading(false);
    }
  };

  // Switch to local timer view
  const handleAcceptTask = async () => {
    if (!suggestion) return;

    // Persist active task data
    const activeTaskData = {
      ...suggestion,
      avoidedTask: avoidedTask.trim(),
    };
    await saveActiveTask(activeTaskData);

    // Configure local timer state
    const seconds = suggestion.duration * 60;
    setTimeLeft(seconds);
    totalSeconds.current = seconds;
    setCompletedSteps(new Array(suggestion.steps.length).fill(false));
    setIsTimerActive(true);
    setIsFinished(false);
    setShowTimer(true);
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const handleStepToggle = (index: number) => {
    const updated = [...completedSteps];
    updated[index] = !updated[index];
    setCompletedSteps(updated);
  };

  const handleCompleteTimer = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerActive(false);
    
    if (suggestion) {
      try {
        await addCompletedTask({
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          duration: suggestion.duration,
          energy: suggestion.energy,
          avoidedTask: avoidedTask.trim(),
          xpEarned: suggestion.duration * 10,
        });
      } catch (e) {
        console.error('Failed to log completed task', e);
      }
    }
    
    setIsFinished(true);
    // Reload streak
    const currentStreak = await getStreak();
    setStreak(currentStreak);
  };

  const handleExitTimer = async () => {
    await clearActiveTask();
    setShowTimer(false);
    setSuggestion(null);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer circular math
  const radius = 90;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds.current > 0 ? timeLeft / totalSeconds.current : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {showTimer && isFinished && <Confetti />}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {showTimer && suggestion ? (
            // ==================== INTEGRATED TIMER VIEW ====================
            <View style={styles.timerWrapper}>
              {/* Header context */}
              <View style={styles.timerHeader}>
                <ThemedText type="smallBold" style={styles.avoidHeader}>
                  PRODUCTIVE AVERSION IN PROGRESS
                </ThemedText>
                <ThemedText style={styles.avoidText}>
                  Instead of: <ThemedText type="smallBold">"{avoidedTask.trim()}"</ThemedText>
                </ThemedText>
              </View>

              {/* Main Workspace Card */}
              <ThemedView type="backgroundElement" style={styles.timerCard}>
                <ThemedText type="subtitle" style={styles.taskTitle}>
                  {suggestion.title}
                </ThemedText>
                <ThemedText style={styles.taskDesc}>{suggestion.description}</ThemedText>

                {/* SVG Circular Timer */}
                <View style={styles.timerContainer}>
                  <Svg width={radius * 2 + stroke * 2} height={radius * 2 + stroke * 2} style={styles.svg}>
                    <Circle
                      cx={radius + stroke}
                      cy={radius + stroke}
                      r={radius}
                      stroke="rgba(128, 128, 128, 0.1)"
                      strokeWidth={stroke}
                      fill="transparent"
                    />
                    <Circle
                      cx={radius + stroke}
                      cy={radius + stroke}
                      r={radius}
                      stroke={isFinished ? '#10B981' : '#6366F1'}
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
                      {isFinished ? 'Awesome job' : isTimerActive ? 'Stay focused' : 'Paused'}
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
                        { backgroundColor: isTimerActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)' },
                        { opacity: pressed ? 0.7 : 1 }
                      ]}
                    >
                      <ThemedText style={[styles.controlButtonText, { color: isTimerActive ? '#EF4444' : '#6366F1' }]}>
                        {isTimerActive ? 'Pause' : 'Resume'}
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      onPress={handleCompleteTimer}
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

              {/* Checklist & Tips */}
              {!isFinished ? (
                <View style={styles.detailsContainer}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Action Plan ({completedSteps.filter(Boolean).length}/{suggestion.steps.length})
                  </ThemedText>
                  <View style={styles.stepsList}>
                    {suggestion.steps.map((step, idx) => (
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
                    {suggestion.tips.map((tip, idx) => (
                      <View key={idx} style={styles.tipItem}>
                        <ThemedText style={styles.tipDot}>💡</ThemedText>
                        <ThemedText style={styles.tipText}>{tip}</ThemedText>
                      </View>
                    ))}
                  </View>
                  
                  <Pressable
                    onPress={handleExitTimer}
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
                // Completion Celebration
                <ThemedView type="backgroundElement" style={styles.celebrationCard}>
                  <ThemedText style={styles.celebrationEmoji}>🎉</ThemedText>
                  <ThemedText type="subtitle" style={styles.celebrationTitle}>
                    Procrastination Productive!
                  </ThemedText>
                  <ThemedText style={styles.celebrationDesc}>
                    You turned {suggestion.duration} minutes of avoidance into something amazing. You've earned:
                  </ThemedText>
                  <ThemedText style={styles.xpTotal}>
                    +{suggestion.duration * 10} XP
                  </ThemedText>
                  <Pressable
                    onPress={handleExitTimer}
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
            </View>
          ) : (
            // ==================== DASHBOARD CONFIG VIEW ====================
            <View>
              {/* Greeting */}
              <View style={styles.greetingHeader}>
                <View>
                  <ThemedText style={styles.greetingText}>
                    {getGreeting()},
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.usernameText}>
                    {username}
                  </ThemedText>
                </View>
                <View style={styles.streakIndicator}>
                  <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
                  <ThemedText type="smallBold">{streak} days</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.heroSub}>
                Turn guilt into action. What are we productively avoiding today?
              </ThemedText>

              {/* Configuration Form */}
              <ThemedView type="backgroundElement" style={styles.formContainer}>
                {/* Avoided Task Input */}
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    1. What task are you avoiding?
                  </ThemedText>
                  <TextInput
                    value={avoidedTask}
                    onChangeText={setAvoidedTask}
                    placeholder="e.g. Writing documentation, cleaning bathroom, taxes..."
                    placeholderTextColor="#9ca3af"
                    style={[styles.textInput, { color: theme.text }]}
                  />
                </View>

                {/* Time Slider Button Grid */}
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    2. How much procrastination time do you have?
                  </ThemedText>
                  <View style={styles.buttonGrid}>
                    {durations.map(d => (
                      <Pressable
                        key={d}
                        onPress={() => setDuration(d)}
                        style={[
                          styles.choiceButton,
                          duration === d && styles.choiceButtonSelected
                        ]}
                      >
                        <ThemedText 
                          style={[
                            styles.choiceText,
                            duration === d && styles.choiceTextSelected
                          ]}
                        >
                          {d} min
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Energy Segmented Controls */}
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    3. What is your current energy level?
                  </ThemedText>
                  <View style={styles.buttonGrid}>
                    {energyLevels.map(e => (
                      <Pressable
                        key={e}
                        onPress={() => setEnergy(e)}
                        style={[
                          styles.choiceButton,
                          energy === e && styles.choiceButtonSelected
                        ]}
                      >
                        <ThemedText 
                          style={[
                            styles.choiceText,
                            styles.capitalize,
                            energy === e && styles.choiceTextSelected
                          ]}
                        >
                          {e}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Preferred Category */}
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    4. Select preference (optional)
                  </ThemedText>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                  >
                    {categories.map(cat => (
                      <Pressable
                        key={cat.value}
                        onPress={() => setCategory(cat.value)}
                        style={[
                          styles.catFilterButton,
                          category === cat.value && styles.catFilterButtonSelected
                        ]}
                      >
                        <ThemedText style={styles.catEmoji}>{cat.emoji}</ThemedText>
                        <ThemedText 
                          style={[
                            styles.catLabel,
                            category === cat.value && styles.catLabelSelected
                          ]}
                        >
                          {cat.label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleGetSuggestion}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.submitButton,
                    { opacity: pressed || isLoading ? 0.8 : 1 }
                  ]}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <ThemedText style={styles.submitButtonText}>
                        Oracle thinking...
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.submitButtonText}>
                      Get AI Suggestion
                    </ThemedText>
                  )}
                </Pressable>
              </ThemedView>

              {/* Suggestion Loading State */}
              {isLoading && (
                <ThemedView type="backgroundElement" style={styles.loadingCard}>
                  <ActivityIndicator color="#6366F1" size="large" />
                  <ThemedText style={styles.loadingPhrase}>
                    {loadingPhrase}
                  </ThemedText>
                </ThemedView>
              )}

              {/* Suggestion Result */}
              {suggestion && !isLoading && (
                <View style={styles.suggestionWrapper}>
                  {/* Offline Warning Banner for transparency */}
                  {!hasApiKey && (
                    <View style={styles.offlineBanner}>
                      <ThemedText style={styles.offlineBannerText}>
                        💡 Using local offline recommender. Enter a Gemini API Key in Settings to generate custom AI-tailored activities!
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText type="smallBold" style={styles.resultTitle}>
                    The Oracle Suggests...
                  </ThemedText>
                  <TaskCard
                    suggestion={suggestion}
                    onAccept={handleAcceptTask}
                    onRefresh={handleGetSuggestion}
                  />
                </View>
              )}
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
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  greetingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  usernameText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  heroSub: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: Spacing.four,
  },
  formContainer: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.four,
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      }
    })
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  choiceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.02)',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  choiceButtonSelected: {
    backgroundColor: '#6366F1', // indigo
    borderColor: '#6366F1',
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: '#ffffff',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  categoryScroll: {
    gap: Spacing.two,
    paddingRight: Spacing.four,
  },
  catFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128, 128, 128, 0.02)',
    gap: Spacing.one,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  catFilterButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  catEmoji: {
    fontSize: 14,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  catLabelSelected: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingCard: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  loadingPhrase: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
  suggestionWrapper: {
    marginTop: Spacing.two,
  },
  resultTitle: {
    marginBottom: Spacing.one,
  },
  offlineBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)', // Amber tint
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  offlineBannerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#F59E0B',
  },

  // ==================== TIMER STYLES ====================
  timerWrapper: {
    alignSelf: 'stretch',
  },
  timerHeader: {
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
    backgroundColor: '#10B981',
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
