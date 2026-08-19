'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { builtInTemplates } from '@/lib/templates';
import { Layout, Terminal, File, Coffee, Cpu, Loader2 } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  Layout: <Layout size={24} />,
  Terminal: <Terminal size={24} />,
  File: <File size={24} />,
  Coffee: <Coffee size={24} />,
  Cpu: <Cpu size={24} />,
};

export default function NewProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, templateId: selectedTemplate })
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to workspace IDE, passing the project name (which is currently used as the physical folder name)
        router.push(`/workspace?id=${encodeURIComponent(data.project.name)}`);
      } else {
        alert('Failed to create project');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <span style={{ fontSize: '1.2rem' }}>+</span> New Project
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '100%', maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Create New Project</h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Project Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. my-awesome-app"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-orange)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select a Template</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '32px'
              }}>
                {builtInTemplates.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${selectedTemplate === t.id ? 'var(--accent-orange)' : 'var(--border-color)'}`,
                      background: selectedTemplate === t.id ? 'rgba(234, 88, 12, 0.05)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ color: selectedTemplate === t.id ? 'var(--accent-orange)' : 'var(--text-secondary)', marginBottom: '12px' }}>
                      {icons[t.icon] || <File size={24} />}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '10px 20px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !name}
                  style={{
                    background: 'var(--accent-purple)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: isLoading || !name ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !name ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isLoading ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
