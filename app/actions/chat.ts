'use server';

import { GoogleGenAI } from '@google/genai';
import { auth } from '@/auth.config';
import { checkAndIncrementQuery, getUserUsage } from '@/lib/db';

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AskAIResult {
  success: boolean;
  text?: string;
  error?: string;
  queriesUsed?: number;
  queriesLimit?: number;
}

export const askAI = async (
  prompt: string,
  history: ChatHistoryItem[] = []
): Promise<AskAIResult> => {
  try {
    // 1. Verify user is logged in
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return {
        success: false,
        error: 'Please sign in to send messages.',
      };
    }

    // 2. Check and enforce 5 prompt limit in Neon database
    const usage = await checkAndIncrementQuery(userEmail, 5);
    if (!usage.allowed) {
      return {
        success: false,
        error: usage.error || 'You have reached your limit of 5 prompts.',
        queriesUsed: usage.queriesUsed,
        queriesLimit: usage.queriesLimit,
      };
    }

    // 3. Check Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error:
          'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your .env file.',
        queriesUsed: usage.queriesUsed,
        queriesLimit: usage.queriesLimit,
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3.8-flash';

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
        queriesUsed: usage.queriesUsed,
        queriesLimit: usage.queriesLimit,
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
      queriesUsed: usage.queriesUsed,
      queriesLimit: usage.queriesLimit,
    };
  } catch (error: any) {
    console.error('API Error in askAI:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch response.',
    };
  }
};

/**
 * Fetch current user prompt usage from Neon database
 */
export const getUserUsageAction = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  return await getUserUsage(session.user.email, 5);
};
