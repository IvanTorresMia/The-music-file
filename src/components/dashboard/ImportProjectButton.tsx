// components/ImportProjectButton.tsx
'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface ImportProjectButtonProps {
  onFiles: (files: File[]) => void;
}

export function ImportProjectButton({ onFiles }: ImportProjectButtonProps) {
  return (
    <label
      className="
        inline-flex items-center gap-2
        bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        text-white font-medium
        px-5 py-3 rounded-lg
        transition-colors duration-150
        cursor-pointer
      "
    >
      <Upload className="w-5 h-5" />
      <span>Import Project</span>
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        accept=".ptx,.wav,.mp3"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          onFiles(Array.from(files));
        }}
      />
    </label>
  );
}
