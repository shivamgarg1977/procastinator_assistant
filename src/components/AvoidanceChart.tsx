import React from 'react';
import { StyleSheet, View, Dimensions, useColorScheme } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { Task } from '@/utils/storage';

interface AvoidanceChartProps {
  tasks: Task[];
}

export function AvoidanceChart({ tasks }: AvoidanceChartProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];

  if (tasks.length === 0) {
    return (
      <ThemedView type="backgroundElement" style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          No activities recorded yet. Complete a task to build your stats!
        </ThemedText>
      </ThemedView>
    );
  }

  // Calculate statistics
  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
  const totalXP = tasks.reduce((sum, t) => sum + t.xpEarned, 0);

  // Group by category
  const categoryCounts = {
    physical: 0,
    learning: 0,
    admin: 0,
    creative: 0,
    quick: 0,
  };
  tasks.forEach(t => {
    if (categoryCounts[t.category] !== undefined) {
      categoryCounts[t.category] += t.duration;
    }
  });

  const categoryColors = {
    physical: '#0ea5e9', // Blue
    learning: '#a855f7', // Purple
    admin: '#f59e0b', // Amber
    creative: '#10b981', // Green
    quick: '#ef4444', // Red
  };

  const categoryLabels = {
    physical: 'Physical',
    learning: 'Learning',
    admin: 'Admin',
    creative: 'Creative',
    quick: 'Quick Task',
  };

  // Group by last 7 days for the chart
  const getLast7DaysData = () => {
    const daysData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dateStr: d.toDateString(),
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: 0,
      };
    }).reverse();

    tasks.forEach(task => {
      const taskDateStr = new Date(task.completedAt).toDateString();
      const match = daysData.find(d => d.dateStr === taskDateStr);
      if (match) {
        match.minutes += task.duration;
      }
    });

    return daysData;
  };

  const chartData = getLast7DaysData();
  const maxMinutes = Math.max(...chartData.map(d => d.minutes), 10); // cap min height at 10

  // Chart config
  const chartHeight = 120;
  const chartWidth = 320;
  const paddingLeft = 30;
  const paddingBottom = 20;
  const barWidth = 24;
  const gap = (chartWidth - paddingLeft - barWidth * 7) / 8;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.chartTitle}>
        Productive Aversion Trends (Last 7 Days)
      </ThemedText>

      {/* SVG Bar Chart */}
      <View style={styles.chartWrapper}>
        <Svg height={chartHeight} width={chartWidth}>
          {/* Y Axis line */}
          <Line
            x1={paddingLeft}
            y1={0}
            x2={paddingLeft}
            y2={chartHeight - paddingBottom}
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="1"
          />
          {/* X Axis line */}
          <Line
            x1={paddingLeft}
            y1={chartHeight - paddingBottom}
            x2={chartWidth}
            y2={chartHeight - paddingBottom}
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="1"
          />

          {/* Grid lines and labels */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = (chartHeight - paddingBottom) * (1 - ratio);
            const val = Math.round(maxMinutes * ratio);
            return (
              <G key={idx}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 4}
                  fill={theme.textSecondary}
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}m
                </SvgText>
              </G>
            );
          })}

          {/* Bars */}
          {chartData.map((d, index) => {
            const x = paddingLeft + gap + index * (barWidth + gap);
            const barHeight = (d.minutes / maxMinutes) * (chartHeight - paddingBottom - 10);
            const y = chartHeight - paddingBottom - barHeight;

            return (
              <G key={index}>
                {/* Background Shadow Bar */}
                <Rect
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight - paddingBottom}
                  fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                  rx="4"
                />
                {/* Active Value Bar */}
                {barHeight > 0 && (
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#6366F1"
                    rx="4"
                  />
                )}
                {/* X Axis Label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 4}
                  fill={theme.textSecondary}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.dayLabel}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Grid summary stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <ThemedText style={styles.statVal}>{totalMinutes}m</ThemedText>
          <ThemedText type="small" style={styles.statLabel}>Avoided Productively</ThemedText>
        </View>
        <View style={styles.statBox}>
          <ThemedText style={[styles.statVal, styles.xpText]}>{totalXP}</ThemedText>
          <ThemedText type="small" style={styles.statLabel}>XP Earned</ThemedText>
        </View>
      </View>

      {/* Category breakdown progress bars */}
      <ThemedText type="smallBold" style={styles.sectionSubtitle}>
        Category Breakdown
      </ThemedText>
      <View style={styles.breakdownContainer}>
        {Object.entries(categoryCounts).map(([cat, minutes]) => {
          const percentage = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
          const color = categoryColors[cat as keyof typeof categoryColors];

          return (
            <View key={cat} style={styles.breakdownRow}>
              <View style={styles.categoryLabelWrapper}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <ThemedText type="small" style={styles.categoryText}>
                  {categoryLabels[cat as keyof typeof categoryLabels]}
                </ThemedText>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: color, width: `${percentage}%` },
                  ]}
                />
              </View>
              <ThemedText type="smallBold" style={styles.percentageText}>
                {percentage}% ({minutes}m)
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
    alignSelf: 'stretch',
    marginVertical: Spacing.two,
  },
  emptyContainer: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  chartTitle: {
    marginBottom: Spacing.three,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginVertical: Spacing.three,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
  },
  xpText: {
    color: '#10B981',
  },
  statLabel: {
    color: '#8A8D93',
    marginTop: Spacing.half,
    fontSize: 11,
    textAlign: 'center',
  },
  sectionSubtitle: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  breakdownContainer: {
    gap: Spacing.two,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  categoryLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: Spacing.one,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 11,
    width: 70,
    textAlign: 'right',
  },
});
