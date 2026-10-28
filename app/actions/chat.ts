'use server';

import { GoogleGenAI } from '@google/genai';

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AskAIResult {
  success: boolean;
  text?: string;
  error?: string;
}

export const askAI = async (
  prompt: string,
  history: ChatHistoryItem[] = []
): Promise<AskAIResult> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error:
          'GEMINI_API_KEY is not configured. Please get a free API key from https://aistudio.google.com/ and set GEMINI_API_KEY=your_key in your .env file.',
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3.8-flash';

    // Disable extended thinking budget so Gemini generates responses with near-zero latency
    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    };

    // Format conversation history for Gemini if prior messages exist
    if (history.length > 0) {
      const contents = history
        .filter((msg) => msg.role !== 'system' && msg.content.trim().length > 0)
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      return {
        success: true,
        text: response.text || 'No response generated.',
      };
    }

    // Single prompt request
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    return {
      success: true,
      text: response.text || 'No response generated.',
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch response from Gemini.',
    };
  }
};
