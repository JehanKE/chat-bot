'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatSession, Message, ChatAttachment, AuthUser } from '../types/chat';
import { Sidebar } from './Sidebar';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { streamMockResponse } from '../lib/mockResponses';

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'demo-session-new',
    title: 'New chat',
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
    model: 'gpt-4o',
    messages: [],
  },
  {
    id: 'demo-session-1',
    title: 'React hooks debugging',
    createdAt: 1729900000000,
    updatedAt: 1729900000000,
    model: 'gpt-4o',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Help me debug a React hook that is causing infinite re-renders in useEffect',
        createdAt: 1729900000000,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Here is how to properly manage state and avoid common pitfall issues with React hooks:

### 1. The Common Issue
Often, infinite re-renders or stale closures occur when dependencies aren't declared correctly in \`useEffect\` or \`useCallback\`.

\`\`\`tsx
import React, { useState, useEffect, useCallback } from 'react';

export function Counter() {
  const [count, setCount] = useState<number>(0);

  // Using functional update avoids stale closure over count
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      increment();
    }, 1000);

    return () => clearInterval(timer);
  }, [increment]);

  return (
    <div className="p-4 bg-zinc-800 rounded-lg text-white">
      <p className="text-xl">Count: {count}</p>
      <button 
        onClick={increment} 
        className="mt-2 px-3 py-1 bg-emerald-600 rounded"
      >
        Increment
      </button>
    </div>
  );
}
\`\`\`

### Key Best Practices:
- **Always provide a cleanup function** for intervals, timers, and event listeners.
- **Use functional updates** \`setCount(c => c + 1)\` instead of reading mutable values directly from outer scope.
- **Keep custom hooks focused** on one single stateful concern.`,
        createdAt: 1729900001000,
        feedback: 'like',
      },
    ],
  },
];

interface ChatContainerProps {
  session?: {
    user?: AuthUser | null;
  } | null;
  user?: AuthUser | null;
}

export const ChatContainer = ({ session, user: userProp }: ChatContainerProps = {}) => {
  const user = userProp ?? session?.user ?? null;
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>(INITIAL_SESSIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentModel, setCurrentModel] = useState('gpt-4o');
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ref to abort streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeMessages = activeSession?.messages || [];

  // Create a new blank chat session
  const handleNewChat = useCallback(() => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: currentModel,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  }, [currentModel, isStreaming]);

  // Handle switching active chat
  const handleSelectSession = (id: string) => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    setActiveSessionId(id);
  };

  // Delete chat session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'New chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: currentModel,
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename chat session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Stop currently streaming response
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Turn off isStreaming flag on the last message
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== activeSessionId) return sess;
        return {
          ...sess,
          messages: sess.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          ),
        };
      })
    );
  };

  /**
   * CORE SEND HANDLER
   * =================
   * NOTE: When you are ready to integrate your actual API (e.g., fetch('/api/chat', ...)),
   * replace the `streamMockResponse(...)` call below with your fetch logic!
   */
  const handleSendMessage = async (content: string, attachments?: ChatAttachment[]) => {
    if ((!content && (!attachments || attachments.length === 0)) || isStreaming) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;

    const userMsg: Message = {
      id: userMessageId,
      role: 'user',
      content,
      createdAt: Date.now(),
      attachments,
    };

    const initialAssistantMsg: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now() + 1,
      isStreaming: true,
    };

    // Auto-derive title if session was generic "New chat"
    const shouldUpdateTitle =
      activeSession.title === 'New chat' && activeSession.messages.length === 0;
    const derivedTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');

    // Append both messages to the session
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== activeSessionId) return sess;
        return {
          ...sess,
          title: shouldUpdateTitle ? derivedTitle : sess.title,
          updatedAt: Date.now(),
          messages: [...sess.messages, userMsg, initialAssistantMsg],
        };
      })
    );

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Streaming response simulation
      await streamMockResponse(
        content,
        // Chunk update callback
        (accumulatedText) => {
          setSessions((prev) =>
            prev.map((sess) => {
              if (sess.id !== activeSessionId) return sess;
              return {
                ...sess,
                messages: sess.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: accumulatedText }
                    : m
                ),
              };
            })
          );
        },
        // Complete callback
        () => {
          setIsStreaming(false);
          setSessions((prev) =>
            prev.map((sess) => {
              if (sess.id !== activeSessionId) return sess;
              return {
                ...sess,
                messages: sess.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, isStreaming: false }
                    : m
                ),
              };
            })
          );
        },
        controller.signal
      );
    } catch {
      setIsStreaming(false);
    }
  };

  // Prompt suggestion clicked on welcome screen
  const handleSelectPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (isStreaming || activeMessages.length === 0) return;

    // Find the last user prompt
    const lastUserMessage = [...activeMessages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove the last assistant message and re-run
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== activeSessionId) return sess;
        const messagesWithoutLast = sess.messages.slice(0, -1);
        return {
          ...sess,
          messages: messagesWithoutLast,
        };
      })
    );

    setTimeout(() => {
      handleSendMessage(lastUserMessage.content);
    }, 100);
  };

  // Message feedback like / dislike
  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== activeSessionId) return sess;
        return {
          ...sess,
          messages: sess.messages.map((m) => {
            if (m.id !== messageId) return m;
            const newFeedback = m.feedback === feedback ? null : feedback;
            return { ...m, feedback: newFeedback };
          }),
        };
      })
    );
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 dark:bg-[#212121] dark:text-[#ececec]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        user={user}
      />

      {/* Main Conversation Column */}
      <main className="relative flex flex-1 flex-col h-full overflow-hidden">
        {/* Message Stream */}
        <MessageList
          messages={activeMessages}
          onSelectPrompt={handleSelectPrompt}
          onRegenerate={handleRegenerate}
          onFeedback={handleFeedback}
          isStreaming={isStreaming}
        />

        {/* Floating Input at Bottom */}
        <div className="relative z-10 w-full">
          {/* Subtle gradient shadow behind input */}
          <div
            className={`pointer-events-none absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t ${
              isDarkMode ? 'from-[#212121] to-transparent' : 'from-white to-transparent'
            }`}
          />
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
            onStop={handleStopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </main>
    </div>
  );
}
