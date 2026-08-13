'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportButton() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    const url = prompt('Enter the GitHub repository clone URL (e.g., https://github.com/username/repo.git):');
    if (!url) return;

    // extract repo name from URL
    const nameMatch = url.match(/\/([^\/]+)(?:\.git)?$/);
    const name = nameMatch ? nameMatch[1].replace('.git', '') : `imported-${Date.now()}`;

    setIsImporting(true);
    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloneUrl: url, name })
      });
      
      if (res.ok) {
        router.push(`/workspace?id=${encodeURIComponent(name)}`);
      } else {
        const err = await res.json();
        alert(`Failed to import repository: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while importing');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <button 
      onClick={handleImport}
      disabled={isImporting}
      style={{ padding: '10px 20px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: isImporting ? 'wait' : 'pointer', opacity: isImporting ? 0.7 : 1 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      {isImporting ? 'Importing...' : 'Import Repository'}
    </button>
  );
}
