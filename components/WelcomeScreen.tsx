'use client';

import React from 'react';

interface WelcomeScreenProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const WelcomeScreen = ({ onSelectPrompt }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center">
      <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
        What can I help with?
      </h2>
    </div>
  );
};
