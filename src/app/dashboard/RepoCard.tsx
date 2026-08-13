'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RepoCard({ project }: { project: any }) {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);

  const handleOpen = async () => {
    if (project.cloneUrl) {
      setIsCloning(true);
      try {
        const res = await fetch('/api/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloneUrl: project.cloneUrl, name: project.name })
        });
        
        if (res.ok) {
          router.push(`/workspace?id=${encodeURIComponent(project.name)}`);
        } else {
          alert('Failed to clone repository');
          setIsCloning(false);
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while cloning');
        setIsCloning(false);
      }
    } else {
      router.push(`/workspace?id=${project.id}`);
    }
  };

  return (
    <div 
      onClick={handleOpen}
      style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer', opacity: isCloning ? 0.7 : 1 }} 
      className="project-card"
    >
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}>
            {project.language === 'TypeScript' ? 'TS' : project.language === 'Python' ? 'PY' : project.language === 'JavaScript' ? 'JS' : project.language?.substring(0, 2).toUpperCase() || '</>'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{project.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{project.lastAccessed}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: project.status === 'Running' ? 'var(--accent-green)' : project.status === 'Sleeping' ? 'var(--accent-orange)' : 'var(--text-secondary)' }}></div>
          {project.status}
        </div>
        
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent-green)' }}>
          {isCloning ? 'Cloning...' : 'Open ➔'}
        </span>
      </div>
    </div>
  );
}
