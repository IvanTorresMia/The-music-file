// components/dashboard/ImportSection.tsx
'use client';

import { ImportProjectButton } from '@/components/dashboard/ImportProjectButton';
import { Button } from '@/components/ui/Button';

interface ImportSectionProps {
  onFiles: (files: File[]) => void;
}

export function ImportSection({ onFiles }: ImportSectionProps) {
  return (
    <section
      className="
      bg-gradient-to-r from-indigo-600 to-blue-600 
      text-white rounded-lg shadow-lg p-8 mb-8
    "
    >
      <h2 className="text-2xl font-bold mb-2">Import a Pro Tools Project</h2>
      <p className="text-indigo-200 mb-6">
        Select a project folder containing your <code>.ptx</code> session and
        audio files (<code>.wav</code>/<code>.mp3</code>).
      </p>
      <ImportProjectButton onFiles={onFiles} />
    </section>
  );
}
