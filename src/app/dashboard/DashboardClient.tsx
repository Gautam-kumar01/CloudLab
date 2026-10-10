'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  GitBranch,
  Cpu,
  Zap,
  FolderGit2,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import RepoCard from './RepoCard';
import ImportButton from './ImportButton';
import NewProjectButton from './NewProjectButton';
import OpenFolderButton from './OpenFolderButton';

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  lastAccessed: string;
  language?: string;
  cloneUrl?: string;
  isPrivate?: boolean;
  stars?: number;
  defaultBranch?: string;
}

interface DashboardClientProps {
  initialProjects: ProjectItem[];
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isAdmin: boolean;
}

export default function DashboardClient({
  initialProjects,
  user,
  isAdmin,
}: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');

  // Extract unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    initialProjects.forEach((p) => {
      if (p.language) langs.add(p.language);
    });
    return ['ALL', ...Array.from(langs)];
  }, [initialProjects]);

  // Filter projects by search query and language
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query));
      const matchesLang =
        selectedLanguage === 'ALL' ||
        (p.language && p.language.toLowerCase() === selectedLanguage.toLowerCase());
      return matchesSearch && matchesLang;
    });
  }, [initialProjects, searchQuery, selectedLanguage]);

  return (
    <div className="dash-container">
      {/* Header Area */}
      <div className="dash-header">
        <div>
          <div className="dash-badge">
            <Sparkles size={12} />
            <span>Cloud Developer Environments</span>
          </div>
          <h1 className="dash-title">Your Repositories & Workspaces</h1>
          <p className="dash-subtitle">
            Open a project in a Docker-backed Linux workspace with a browser IDE, terminal, and live collaboration tools.
          </p>
        </div>

        <div className="dash-actions-group">
          {isAdmin && (
            <Link
              href="/admin/workspaces"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono tracking-wide text-white bg-red-600/80 hover:bg-red-500 border border-red-500/30 transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              <Layers size={14} />
              <span>Admin Panel</span>
            </Link>
          )}
          <OpenFolderButton />
          <ImportButton />
          <NewProjectButton />
        </div>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="dash-telemetry-grid">
        <div className="dash-telemetry-card">
          <div className="dash-telemetry-label">
            <GitBranch size={13} className="text-emerald-400" />
            <span>Repositories</span>
          </div>
          <div className="dash-telemetry-val">{initialProjects.length}</div>
        </div>

        <div className="dash-telemetry-card">
          <div className="dash-telemetry-label">
            <Zap size={13} className="text-amber-400" />
            <span>Workspace runtime</span>
          </div>
          <div className="dash-telemetry-val" style={{ color: '#34d399' }}>
            Docker container
          </div>
        </div>

        <div className="dash-telemetry-card">
          <div className="dash-telemetry-label">
            <Cpu size={13} className="text-blue-400" />
            <span>Workspace limits</span>
          </div>
          <div className="dash-telemetry-val">1 vCPU / 1 GB RAM</div>
        </div>

        <div className="dash-telemetry-card">
          <div className="dash-telemetry-label">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Kernel model</span>
          </div>
          <div className="dash-telemetry-val">Shared Linux kernel</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="dash-toolbar">
        <div className="dash-search-wrapper">
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name or tech..."
            className="dash-search-input"
          />
        </div>

        <div className="dash-filter-pills">
          <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Filter size={12} /> Filter:
          </span>
          {availableLanguages.slice(0, 6).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLanguage(lang)}
              className={`dash-filter-btn ${selectedLanguage === lang ? 'is-active' : ''}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories Grid */}
      {filteredProjects.length > 0 ? (
        <div className="dash-grid">
          {filteredProjects.map((project) => (
            <RepoCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '16px',
            }}
          >
            <FolderGit2 size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            No repositories found
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', marginBottom: '24px', lineHeight: 1.6 }}>
            {searchQuery
              ? `No repositories matched "${searchQuery}". Try clearing search or filter.`
              : 'Import a GitHub repository or create a new workspace project to get started.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLanguage('ALL');
              }}
              className="dash-filter-btn"
            >
              Reset Filters
            </button>
            <NewProjectButton />
          </div>
        </div>
      )}
    </div>
  );
}
