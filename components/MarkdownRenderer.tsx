'use client';

import React, { useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  // Split into code block chunks vs text chunks
  const parts = splitCodeBlocks(content);

  return (
    <div className="space-y-3 leading-7 text-[15px] break-words">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              language={part.language || 'text'}
              code={part.content}
            />
          );
        }
        return <TextChunk key={index} text={part.content} />;
      })}
    </div>
  );
}

const splitCodeBlocks = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || '',
      content: match[2]?.trimEnd() || '',
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] shadow-md">
      {/* Code header bar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-1.5 text-xs text-zinc-400">
        <span className="font-mono lowercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-white/10 hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon size={14} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre className="overflow-x-auto p-4 text-[13.5px] font-mono leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const TextChunk = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        renderedElements.push(
          <ul key={`ul-${renderedElements.length}`} className="my-2 list-disc space-y-1 pl-6">
            {currentList.items}
          </ul>
        );
      } else {
        renderedElements.push(
          <ol key={`ol-${renderedElements.length}`} className="my-2 list-decimal space-y-1 pl-6">
            {currentList.items}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <h3 key={i} className="mt-3 mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      renderedElements.push(
        <h2 key={i} className="mt-4 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {formatInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      renderedElements.push(
        <h1 key={i} className="mt-4 mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {formatInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      renderedElements.push(
        <blockquote
          key={i}
          className="my-2 border-l-2 border-zinc-300 dark:border-zinc-500 pl-3 italic text-zinc-600 dark:text-zinc-400"
        >
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Unordered list item
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(
        <li key={i} className="text-zinc-800 dark:text-zinc-200">
          {formatInline(bulletMatch[1])}
        </li>
      );
      continue;
    }

    // Ordered list item
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(
        <li key={i} className="text-zinc-800 dark:text-zinc-200">
          {formatInline(numberMatch[2])}
        </li>
      );
      continue;
    }

    // Regular line / paragraph
    flushList();
    renderedElements.push(
      <p key={i} className="my-1.5 text-zinc-800 dark:text-zinc-200">
        {formatInline(rawLine)}
      </p>
    );
  }

  flushList();

  return <>{renderedElements}</>;
}

const formatInline = (text: string): React.ReactNode => {
  // Match inline code, bold, italic
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-black/[0.06] dark:bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-zinc-900 dark:text-zinc-100 border border-black/5 dark:border-transparent"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-zinc-950 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-zinc-700 dark:text-zinc-300">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

