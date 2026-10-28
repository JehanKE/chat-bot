'use client';

import React, { useRef, useEffect, useState, ChangeEvent, KeyboardEvent } from 'react';
import {
  SendIcon,
  StopIcon,
  PlusIcon,
  CloseIcon,
  PaperclipIcon,
  GoogleIcon,
} from './icons';
import { ChatAttachment } from '../types/chat';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (content: string, attachments?: ChatAttachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  isLoggedIn?: boolean;
  queriesUsed?: number;
  queriesLimit?: number;
  onSignIn?: () => void;
}

export const ChatInput = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  isLoggedIn = true,
  queriesUsed,
  queriesLimit = 5,
  onSignIn,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  const isLimitReached = Boolean(
    isLoggedIn && queriesUsed !== undefined && queriesUsed >= queriesLimit
  );
  const isInputBlocked = disabled || !isLoggedIn || isLimitReached;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap at 200px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!isLoggedIn) {
      onSignIn?.();
      return;
    }

    if (isLimitReached) {
      return;
    }

    const trimmed = input.trim();
    if ((trimmed || attachments.length > 0) && !isStreaming && !isInputBlocked) {
      onSend(trimmed, attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ChatAttachment[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || 'file',
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  // Dynamic placeholder text
  let placeholder = 'What can I help you with today?';
  if (!isLoggedIn) {
    placeholder = 'Please sign in with Google to start chatting...';
  } else if (isLimitReached) {
    placeholder = `You have reached your limit of ${queriesLimit} prompts.`;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      {/* Outer Input Card */}
      <div
        onClick={() => {
          if (!isLoggedIn) {
            onSignIn?.();
          }
        }}
        className={`relative rounded-3xl bg-[#f4f4f4] border border-black/10 shadow-lg dark:bg-[#2f2f2f] dark:border-white/10 dark:shadow-2xl transition-all ${
          !isLoggedIn ? 'cursor-pointer hover:border-black/20 dark:hover:border-white/20' : 'focus-within:border-black/20 dark:focus-within:border-white/20'
        }`}
      >
        {/* Attachment preview pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1 border-b border-black/5 dark:border-white/5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-transparent"
              >
                <PaperclipIcon size={13} className="text-zinc-500 dark:text-zinc-400" />
                <span className="max-w-[150px] truncate">{att.name}</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">({att.size})</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAttachment(att.id);
                  }}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isInputBlocked}
            className="w-full resize-none bg-transparent text-zinc-900 placeholder-zinc-500 dark:text-white dark:placeholder-zinc-400 outline-none text-[15px] leading-relaxed max-h-[200px] overflow-y-auto disabled:cursor-not-allowed"
          />
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left side actions (Attach & Usage indicator) */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <button
              type="button"
              disabled={isInputBlocked}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:text-black hover:bg-black/10 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Attach files"
            >
              <PlusIcon size={18} />
            </button>

            {/* Prompt usage counter badge for logged-in users */}
            {isLoggedIn && queriesUsed !== undefined && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                  isLimitReached
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                    : 'bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-black/5 dark:border-white/5'
                }`}
              >
                {Math.max(0, queriesLimit - queriesUsed)} / {queriesLimit} prompts left
              </span>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              /* Not logged in: Show Google sign in button */
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center gap-1.5 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-3.5 py-1.5 text-xs font-medium shadow-md transition-all active:scale-95 cursor-pointer"
                title="Sign in with Google to start chatting"
              >
                <GoogleIcon size={14} />
                <span>Sign in to chat</span>
              </button>
            ) : isStreaming ? (
              /* Generating stream: Show stop button */
              <button
                type="button"
                onClick={onStop}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black transition-all hover:opacity-90 active:scale-95 shadow-md cursor-pointer"
                title="Stop generating"
              >
                <StopIcon size={14} />
              </button>
            ) : (
              /* Ready to send */
              <button
                type="button"
                onClick={handleSend}
                disabled={!hasContent || isInputBlocked}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
                  hasContent && !isInputBlocked
                    ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md cursor-pointer'
                    : 'bg-black/10 text-zinc-400 dark:bg-white/10 dark:text-zinc-500 cursor-not-allowed'
                }`}
                title={
                  isLimitReached
                    ? 'Prompt limit reached (5/5)'
                    : 'Send message'
                }
              >
                <SendIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
        AI can make mistakes. Please verify any important information.
      </p>
    </div>
  );
};
