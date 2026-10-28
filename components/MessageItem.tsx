'use client';

import React, { useState } from 'react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  PaperclipIcon,
} from './icons';

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
}

export const MessageItem = ({
  message,
}: MessageItemProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end py-3 px-4 max-w-3xl mx-auto">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-2">
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-transparent"
                >
                  <PaperclipIcon size={12} className="text-zinc-500 dark:text-zinc-400" />
                  <span className="truncate max-w-[120px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* User message bubble */}
          <div className="rounded-3xl bg-[#f4f4f4] text-zinc-900 border border-black/5 dark:border-transparent dark:bg-[#2f2f2f] dark:text-white px-5 py-3 text-[15px] leading-relaxed shadow-xs">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="group w-full py-4 px-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
      <div className="flex gap-4 max-w-3xl mx-auto">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-black/10 bg-zinc-100 text-zinc-800 shadow-xs dark:border-white/10 dark:bg-[#171717] dark:text-white mt-0.5">
          <SparklesIcon size={16} />
        </div>

        {/* Content & Actions */}
        <div className="flex-1 overflow-hidden space-y-2">
          {/* Message text */}
          <div className="text-zinc-900 dark:text-zinc-100 text-[15px] leading-relaxed">
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-zinc-900 dark:bg-white animate-pulse align-middle" />
            )}
          </div>

          {/* Assistant Action Bar */}
          {!message.isStreaming && (
            <div className="flex items-center gap-1 pt-1 opacity-75 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <CheckIcon size={14} className="text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <CopyIcon size={14} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

