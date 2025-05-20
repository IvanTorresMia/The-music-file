'use client';

import { useState, useEffect } from 'react';
import { ImportSection } from '@/components/dashboard/ImportSection';

export default function DashboardPage() {
  const [importedFiles, setImportedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (importedFiles.length > 0) {
      console.log('Imported:', importedFiles);
    }
  }, [importedFiles]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <ImportSection onFiles={setImportedFiles} />

      {importedFiles.length > 0 && (
        <section className="bg-gradient-to-r rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preview of Imported Files</h2>
          <ul className="list-disc pl-5 space-y-1 max-h-80 overflow-auto">
            {importedFiles.map((file) => (
              <li key={file.webkitRelativePath}>
                {file.webkitRelativePath} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}