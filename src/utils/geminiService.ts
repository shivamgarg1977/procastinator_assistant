import { Suggestion, getOfflineSuggestion } from './mockData';
import { getSettings } from './storage';

export async function fetchAISuggestion(
  avoidedTask: string,
  duration: number,
  energy: 'low' | 'medium' | 'high',
  preferredCategory: string = 'all'
): Promise<Suggestion> {
  const settings = await getSettings();
  const apiKey = settings.geminiApiKey;

  // Fallback to offline immediately if no API key is provided
  if (!apiKey || apiKey.trim() === '') {
    console.log('No Gemini API key found, using offline recommender.');
    return getOfflineSuggestion(avoidedTask, duration, energy, preferredCategory);
  }

  try {
    const prompt = `You are a helpful productivity and mindfulness coach. 
The user is currently procrastinating and avoiding the task: "${avoidedTask}".
They want to do something productive instead, but they only have ${duration} minutes and their energy level is "${energy}".
${preferredCategory !== 'all' ? `They prefer a task in the "${preferredCategory}" category.` : ''}

Suggest ONE fun, engaging, and constructive "productive procrastination" task that fits their duration and energy level. The task MUST be completely unrelated to the work they are avoiding ("${avoidedTask}"). It should help them clear their head, get physical movement, learn a tiny fun fact, or tackle a small domestic/admin chore.

You must respond in JSON format matching this TypeScript interface:
interface Suggestion {
  title: string; // Catchy, fun title for the activity
  description: string; // 1-2 sentence description connecting back to why they should do this while avoiding "${avoidedTask}"
  category: 'physical' | 'learning' | 'admin' | 'creative' | 'quick'; // Choose the single best category
  duration: number; // Must be <= ${duration}
  energy: 'low' | 'medium' | 'high'; // Match or adapt to the user's energy level
  steps: string[]; // 3-4 specific, actionable steps to complete the task
  tips: string[]; // 2 encouraging tips or best practices for the task
}

Do not include any markdown backticks in the response. Return ONLY the raw JSON string.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedSuggestion: Suggestion = JSON.parse(textContent);
    
    // Validate fields to prevent runtime errors
    if (
      parsedSuggestion.title &&
      parsedSuggestion.description &&
      Array.isArray(parsedSuggestion.steps) &&
      parsedSuggestion.steps.length > 0
    ) {
      // Ensure category is valid
      const validCategories = ['physical', 'learning', 'admin', 'creative', 'quick'];
      if (!validCategories.includes(parsedSuggestion.category)) {
        parsedSuggestion.category = 'learning';
      }
      return parsedSuggestion;
    }

    throw new Error('JSON response did not match expected structure');
  } catch (e) {
    console.warn('Gemini API call failed, falling back to offline suggestions:', e);
    return getOfflineSuggestion(avoidedTask, duration, energy, preferredCategory);
  }
}
