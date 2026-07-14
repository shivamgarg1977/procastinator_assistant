import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { Suggestion } from '@/utils/mockData';

interface TaskCardProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function TaskCard({ suggestion, onAccept, onRefresh, isLoading = false }: TaskCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  // Custom styling for categories
  const categoryColors = {
    physical: { bg: '#E0F2FE', text: '#0369A1', darkBg: '#082F49', darkText: '#38BDF8', label: 'Physical Reboot' },
    learning: { bg: '#F3E8FF', text: '#6B21A8', darkBg: '#2E1065', darkText: '#C084FC', label: 'Mind Expander' },
    admin: { bg: '#FEF3C7', text: '#92400E', darkBg: '#451A03', darkText: '#FBBF24', label: 'Life Admin' },
    creative: { bg: '#DCFCE7', text: '#166534', darkBg: '#052E16', darkText: '#4ADE80', label: 'Creative Boost' },
    quick: { bg: '#FEE2E2', text: '#991B1B', darkBg: '#450A0A', darkText: '#FCA5A5', label: 'Micro Task' },
  };

  const catStyle = categoryColors[suggestion.category] || categoryColors.learning;
  const xpEarned = suggestion.duration * 10;

  return (
    <ThemedView type="backgroundElement" style={styles.cardContainer}>
      {/* Category Tag */}
      <View style={[
        styles.tag, 
        { backgroundColor: isDark ? catStyle.darkBg : catStyle.bg }
      ]}>
        <ThemedText style={[
          styles.tagText, 
          { color: isDark ? catStyle.darkText : catStyle.text }
        ]}>
          {catStyle.label}
        </ThemedText>
      </View>

      {/* Title */}
      <ThemedText type="subtitle" style={styles.title}>
        {suggestion.title}
      </ThemedText>

      {/* Description */}
      <ThemedText style={styles.description}>
        {suggestion.description}
      </ThemedText>

      {/* Badges row */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <ThemedText type="small" style={styles.badgeLabel}>DURATION</ThemedText>
          <ThemedText type="smallBold">{suggestion.duration} mins</ThemedText>
        </View>
        <View style={styles.badge}>
          <ThemedText type="small" style={styles.badgeLabel}>ENERGY</ThemedText>
          <ThemedText type="smallBold" style={styles.capitalize}>{suggestion.energy}</ThemedText>
        </View>
        <View style={styles.badge}>
          <ThemedText type="small" style={styles.badgeLabel}>REWARD</ThemedText>
          <ThemedText type="smallBold" style={styles.xpText}>+{xpEarned} XP</ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Pressable 
          onPress={onRefresh} 
          disabled={isLoading}
          style={({ pressed }) => [
            styles.secondaryButton,
            { opacity: pressed || isLoading ? 0.6 : 1 }
          ]}
        >
          <ThemedText style={styles.secondaryButtonText}>
            {isLoading ? 'Thinking...' : 'Suggest Another'}
          </ThemedText>
        </Pressable>

        <Pressable 
          onPress={onAccept}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            { opacity: pressed || isLoading ? 0.8 : 1 }
          ]}
        >
          <ThemedText style={styles.primaryButtonText}>
            Let's Do It
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginVertical: Spacing.two,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
    marginBottom: Spacing.three,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.85,
    marginBottom: Spacing.four,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  badge: {
    alignItems: 'center',
    flex: 1,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8D93',
    marginBottom: Spacing.half,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  xpText: {
    color: '#10B981',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#6366F1', // Indigo primary
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      }
    })
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      }
    })
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
