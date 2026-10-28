export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  attachments?: ChatAttachment[];
  feedback?: 'like' | 'dislike' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface AIModel {
  id: string;
  name: string;
  badge?: string;
  description: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface AuthUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}


