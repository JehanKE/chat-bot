'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, AuthUser } from '../types/chat';
import {
  SidebarToggleIcon,
  EditIcon,
  TrashIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  CheckIcon,
  CloseIcon,
  GoogleIcon,
  LogOutIcon,
  MoreHorizontalIcon,
} from './icons';
import { loginWithGoogle, logout } from '../app/actions/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  user?: AuthUser | null;
  queriesUsed?: number;
  queriesLimit?: number;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isDarkMode,
  onToggleTheme,
  user,
  queriesUsed,
  queriesLimit = 5,
}: SidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Group sessions safely
  const now = currentTime ?? 0;
  const oneDay = 24 * 60 * 60 * 1000;

  const todaySessions = now > 0
    ? sessions.filter((s) => now - s.updatedAt < oneDay)
    : sessions;
  const yesterdaySessions = now > 0
    ? sessions.filter((s) => now - s.updatedAt >= oneDay && now - s.updatedAt < 2 * oneDay)
    : [];
  const previousSessions = now > 0
    ? sessions.filter((s) => now - s.updatedAt >= 2 * oneDay)
    : [];

  const renderGroup = (title: string, groupList: ChatSession[]) => {
    if (groupList.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          {title}
        </h4>
        <div className="space-y-0.5">
          {groupList.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => {
                  if (!isEditing) onSelectSession(session.id);
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-black/10 text-black font-semibold dark:bg-white/10 dark:text-white dark:font-medium'
                    : 'text-zinc-700 hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => saveRename(session.id, e)}
                    className="flex flex-1 items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded bg-white dark:bg-black/40 px-2 py-0.5 text-xs text-zinc-900 dark:text-white outline-none border border-black/20 dark:border-white/20"
                    />
                    <button
                      type="submit"
                      className="p-1 hover:text-emerald-500 dark:hover:text-emerald-400 text-zinc-500 dark:text-zinc-300"
                    >
                      <CheckIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="p-1 hover:text-red-500 dark:hover:text-red-400 text-zinc-500 dark:text-zinc-300"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="truncate pr-2">{session.title}</span>

                    {/* Action buttons on hover */}
                    <div
                      className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'opacity-100' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => startRename(session, e)}
                        className="rounded p-1 text-zinc-400 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10"
                        title="Rename"
                      >
                        <EditIcon size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-black/5 dark:hover:text-red-400 dark:hover:bg-white/10"
                        title="Delete chat"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-black/10 bg-[#f9f9f9] text-zinc-800 dark:border-white/5 dark:bg-[#171717] dark:text-zinc-300 transition-all duration-300 ease-in-out md:static ${
          isOpen ? 'w-[260px]' : 'w-[64px]'
        }`}
      >
        <div
          className={`flex h-full flex-col justify-between transition-all duration-300 ${
            isOpen ? 'w-[260px] p-3' : 'w-[64px] px-2 py-3 items-center'
          }`}
        >
          {/* Top Header Actions */}
          {isOpen ? (
            <div className="flex items-center justify-between px-1 mb-2">
              <button
                onClick={onToggle}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-black hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <SidebarToggleIcon size={20} />
              </button>

              <button
                onClick={onNewChat}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-black hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="New chat"
              >
                <EditIcon size={19} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 mb-2">
              <button
                onClick={onToggle}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-black hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <SidebarToggleIcon size={20} />
              </button>

              <button
                onClick={onNewChat}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-black hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="New chat"
              >
                <EditIcon size={19} />
              </button>
            </div>
          )}

          {/* Conversations History */}
          {isOpen ? (
            <div className="flex-1 overflow-y-auto pt-2 pb-2">
              {sessions.length === 0 ? (
                <div className="px-3 text-center text-xs text-zinc-400 dark:text-zinc-500 py-8">
                  No conversations yet
                </div>
              ) : (
                <>
                  {renderGroup('Today', todaySessions)}
                  {renderGroup('Yesterday', yesterdaySessions)}
                  {renderGroup('Previous 7 Days', previousSessions)}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Footer Controls & User Profile */}
          <div className={`pt-3 ${isOpen ? 'border-t border-black/10 dark:border-white/10 w-full space-y-2' : 'w-full flex justify-center'}`}>
            {/* User Account or Sign In Tile */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                {/* Popover Menu */}
                {profileMenuOpen && (
                  <div
                    className={`rounded-2xl border border-black/10 bg-white text-zinc-900 shadow-xl dark:border-white/10 dark:bg-[#252525] dark:text-white dark:shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                      isOpen
                        ? 'absolute bottom-full left-0 mb-2 w-full'
                        : 'absolute bottom-0 left-[68px] w-64'
                    }`}
                  >
                    {/* User Info Header */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-black/10 dark:border-white/10">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User profile"}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-semibold text-xs text-white shrink-0">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {user.name || 'User'}
                        </span>
                        {user.email && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prompt Usage Info */}
                    <div className="flex items-center justify-between px-3 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 border-b border-black/5 dark:border-white/5">
                      <span>Free prompts used</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {queriesUsed ?? 0} / {queriesLimit}
                      </span>
                    </div>

                    {/* Popover Actions */}
                    <div className="pt-1 space-y-0.5">
                      {/* Theme Switcher inside Profile Menu */}
                      <button
                        type="button"
                        onClick={onToggleTheme}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          {isDarkMode ? <MoonIcon size={15} /> : <SunIcon size={15} />}
                          <span>{isDarkMode ? 'Dark theme' : 'Light theme'}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Switch</span>
                      </button>

                      {/* Log out */}
                      <form action={logout}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-red-500/10 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <LogOutIcon size={15} />
                          <span>Log out</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Profile Trigger Button */}
                {isOpen ? (
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex w-full items-center justify-between rounded-xl p-2 transition-colors cursor-pointer ${
                      profileMenuOpen
                        ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white'
                        : 'hover:bg-black/5 text-zinc-800 dark:hover:bg-white/5 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User profile"}
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-semibold text-xs text-white shrink-0">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-medium text-zinc-800 dark:text-white truncate">
                          {user.name || user.email || 'User'}
                        </span>
                        {queriesUsed !== undefined && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {queriesUsed} / {queriesLimit} prompts
                          </span>
                        )}
                      </div>
                    </div>

                    <MoreHorizontalIcon size={16} className="text-zinc-500 dark:text-zinc-400 shrink-0 ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-black/20 dark:hover:ring-white/20 cursor-pointer"
                    title={user.name || "User profile"}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User profile"}
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-semibold text-xs text-white shrink-0">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                )}
              </div>
            ) : (
              isOpen ? (
                <div className="space-y-2 w-full">
                  {/* Theme switcher when logged out */}
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {isDarkMode ? <MoonIcon size={15} /> : <SunIcon size={15} />}
                      <span>{isDarkMode ? 'Dark theme' : 'Light theme'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Switch</span>
                  </button>

                  <form action={loginWithGoogle} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/15 bg-white text-zinc-800 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 px-3 py-2.5 text-xs font-medium transition-all active:scale-[0.99] cursor-pointer shadow-xs"
                    >
                      <GoogleIcon size={16} />
                      <span>Sign in with Google</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <form action={loginWithGoogle}>
                    <button
                      type="submit"
                      title="Sign in with Google"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/15 bg-white text-zinc-800 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-all cursor-pointer shadow-xs"
                    >
                      <GoogleIcon size={18} />
                    </button>
                  </form>
                </div>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
