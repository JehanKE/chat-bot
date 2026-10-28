'use client';

import React, { useRef, useEffect, useState, UIEvent } from 'react';
import { Message } from '../types/chat';
import { MessageItem } from './MessageItem';
import { WelcomeScreen } from './WelcomeScreen';
import { ArrowDownIcon } from './icons';

interface MessageListProps {
  messages: Message[];
  onSelectPrompt: (promptText: string) => void;
  onRegenerate: () => void;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  isStreaming: boolean;
}

export const MessageList = ({
  messages,
  onSelectPrompt,
  onRegenerate,
  onFeedback,
  isStreaming,
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollEnabled = useRef(true);

  // Detect user scroll
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    
    // If user is within 100px from the bottom, keep auto-scroll on
    if (distanceToBottom > 120) {
      setShowScrollBottom(true);
      isAutoScrollEnabled.current = false;
    } else {
      setShowScrollBottom(false);
      isAutoScrollEnabled.current = true;
    }
  };

  // Scroll to bottom when new messages or streaming tokens arrive
  useEffect(() => {
    if (isAutoScrollEnabled.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    isAutoScrollEnabled.current = true;
    setShowScrollBottom(false);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
        <WelcomeScreen onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-8"
    >
      <div className="flex flex-col space-y-1">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onRegenerate={
              message.role === 'assistant' ? onRegenerate : undefined
            }
            onFeedback={onFeedback}
          />
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-8 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-800 shadow-lg hover:bg-zinc-100 dark:border-white/10 dark:bg-[#2f2f2f] dark:text-white dark:hover:bg-[#3f3f3f] dark:shadow-xl transition-all active:scale-95 animate-in fade-in cursor-pointer"
          title="Scroll to bottom"
        >
          <ArrowDownIcon size={16} />
        </button>
      )}
    </div>
  );
}

