'use client';

import React from 'react';
import { SidebarToggleIcon, EditIcon } from './icons';
import { ModelSelector } from './ModelSelector';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentModel: string;
  onSelectModel: (modelId: string) => void;
  onNewChat: () => void;
}

export const Header = ({
  sidebarOpen,
  onToggleSidebar,
  currentModel,
  onSelectModel,
  onNewChat,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between px-3 backdrop-blur-md bg-white/80 dark:bg-[#212121]/80 border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-2">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-black hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <SidebarToggleIcon size={20} />
        </button>

        {/* Model Selector Dropdown */}
        <ModelSelector
          currentModel={currentModel}
          onSelectModel={onSelectModel}
        />
      </div>

      {/* Right Action (New Chat Quick Button) */}
      <button
        onClick={onNewChat}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-black hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
        title="New chat"
      >
        <EditIcon size={19} />
      </button>
    </header>
  );
}

