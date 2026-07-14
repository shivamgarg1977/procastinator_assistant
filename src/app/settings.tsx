import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, Switch, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSettings, saveSettings, clearAllData, AppSettings } from '@/utils/storage';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: '',
    username: 'Productive Avoider',
    themePreference: 'system',
    soundEnabled: true,
    hapticEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    async function loadSettings() {
      const saved = await getSettings();
      setSettings(saved);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (updatedSettings: AppSettings) => {
    setSaveStatus('saving');
    await saveSettings(updatedSettings);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleApiKeyChange = (text: string) => {
    const updated = { ...settings, geminiApiKey: text };
    setSettings(updated);
    handleSave(updated);
  };

  const handleUsernameChange = (text: string) => {
    const updated = { ...settings, username: text };
    setSettings(updated);
    handleSave(updated);
  };

  const toggleSound = (val: boolean) => {
    const updated = { ...settings, soundEnabled: val };
    setSettings(updated);
    handleSave(updated);
  };

  const toggleHaptic = (val: boolean) => {
    const updated = { ...settings, hapticEnabled: val };
    setSettings(updated);
    handleSave(updated);
  };

  const handleClearData = () => {
    const performClear = async () => {
      await clearAllData();
      setSettings({
        geminiApiKey: '',
        username: 'Productive Avoider',
        themePreference: 'system',
        soundEnabled: true,
        hapticEnabled: true,
      });
      if (Platform.OS === 'web') {
        alert('All app data has been successfully cleared!');
      } else {
        Alert.alert('Data Cleared', 'All app data has been successfully cleared!');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you absolutely sure you want to clear all your history, stats, settings, and streak? This action is permanent.')) {
        performClear();
      }
    } else {
      Alert.alert(
        'Clear All Data',
        'Are you absolutely sure you want to reset everything? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset Everything', style: 'destructive', onPress: performClear }
        ]
      );
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading Settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <ThemedText type="subtitle">Settings</ThemedText>
            {saveStatus === 'saving' && <ThemedText type="small" style={styles.statusText}>Saving...</ThemedText>}
            {saveStatus === 'saved' && <ThemedText type="small" style={styles.savedStatusText}>Saved ✓</ThemedText>}
          </View>

          {/* User Profile */}
          <ThemedView type="backgroundElement" style={styles.sectionCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>User Profile</ThemedText>
            
            <ThemedText type="small" style={styles.inputLabel}>Name / Nickname</ThemedText>
            <TextInput
              value={settings.username}
              onChangeText={handleUsernameChange}
              placeholder="Productive Avoider"
              placeholderTextColor="#9ca3af"
              style={[styles.textInput, { color: theme.text }]}
            />
          </ThemedView>

          {/* Gemini AI Config */}
          <ThemedView type="backgroundElement" style={styles.sectionCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Gemini AI Integration</ThemedText>
            <ThemedText style={styles.settingHelp}>
              Input a Gemini API Key to enable real-time, highly tailored procrastination suggestions based on exactly what task you're avoiding. If empty, the app runs in local offline mode.
            </ThemedText>
            
            <ThemedText type="small" style={styles.inputLabel}>Gemini API Key</ThemedText>
            <TextInput
              value={settings.geminiApiKey}
              onChangeText={handleApiKeyChange}
              placeholder="AIzaSy..."
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={[styles.textInput, { color: theme.text }]}
            />
            <ThemedText type="code" style={styles.keyInstructions}>
              Keys are stored securely in local storage and never leave your device.
            </ThemedText>
          </ThemedView>

          {/* Preferences */}
          <ThemedView type="backgroundElement" style={styles.sectionCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>App Preferences</ThemedText>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <ThemedText style={styles.toggleTitle}>Enable Focus Sounds</ThemedText>
                <ThemedText type="small" style={styles.toggleDesc}>
                  Play ticking sound and completion bell
                </ThemedText>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: '#818cf8' }}
                thumbColor={settings.soundEnabled ? '#4f46e5' : '#f4f3f4'}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <ThemedText style={styles.toggleTitle}>Enable Haptic Feedback</ThemedText>
                <ThemedText type="small" style={styles.toggleDesc}>
                  Vibrate device on timer updates and clicks
                </ThemedText>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={toggleHaptic}
                trackColor={{ false: '#767577', true: '#818cf8' }}
                thumbColor={settings.hapticEnabled ? '#4f46e5' : '#f4f3f4'}
              />
            </View>
          </ThemedView>

          {/* Danger Zone */}
          <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.dangerCard]}>
            <ThemedText type="smallBold" style={[styles.sectionTitle, styles.dangerTitle]}>
              Danger Zone
            </ThemedText>
            <ThemedText style={styles.settingHelp}>
              Permanently clear your stats, streak history, user profile settings, and API configuration.
            </ThemedText>
            
            <Pressable 
              onPress={handleClearData} 
              style={({ pressed }) => [
                styles.deleteButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <ThemedText style={styles.deleteButtonText}>
                Clear All App Data
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedText style={styles.footerVersion}>
            Procrastination Assistant v1.0.0
          </ThemedText>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  statusText: {
    color: '#8A8D93',
  },
  savedStatusText: {
    color: '#10B981',
    fontWeight: '600',
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    fontSize: 16,
  },
  settingHelp: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginBottom: Spacing.three,
  },
  inputLabel: {
    color: '#8A8D93',
    marginBottom: Spacing.one,
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
  keyInstructions: {
    fontSize: 11,
    color: '#8A8D93',
    marginTop: Spacing.two,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.05)',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: Spacing.three,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleDesc: {
    color: '#8A8D93',
    marginTop: 2,
    fontSize: 12,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerTitle: {
    color: '#EF4444',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      }
    })
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  footerVersion: {
    textAlign: 'center',
    color: '#8A8D93',
    fontSize: 12,
    marginTop: Spacing.two,
    opacity: 0.5,
  },
});
