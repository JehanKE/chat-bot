'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SparklesIcon, CheckIcon } from './icons';
import { AIModel } from '../types/chat';

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'ChatGPT-4o',
    badge: 'Smartest',
    description: 'Great for most tasks, reasoning, and coding',
    isPopular: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT-4o mini',
    badge: 'Fastest',
    description: 'Everyday tasks and quick answers with high speed',
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    badge: 'Reasoning',
    description: 'Advanced STEM reasoning and deep math calculations',
    isNew: true,
  },
];

interface ModelSelectorProps {
  currentModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelector = ({ currentModel, onSelectModel }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-base font-semibold text-zinc-800 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10 transition-colors"
      >
        <span>{activeModel.name}</span>
        <ChevronDownIcon
          size={16}
          className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 rounded-2xl border border-black/10 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#2f2f2f] dark:shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Model Selection
          </div>
          <div className="space-y-1">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === currentModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-black/5 text-black dark:bg-white/10 dark:text-white'
                      : 'text-zinc-700 hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.badge && (
                        <span className="rounded-full bg-black/5 text-zinc-700 dark:bg-white/10 dark:text-zinc-300 px-1.5 py-0.5 text-[10px] font-semibold">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{model.description}</p>
                  </div>
                  {isSelected && (
                    <CheckIcon size={16} className="mt-1 text-black dark:text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

