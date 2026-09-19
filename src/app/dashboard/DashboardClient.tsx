'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Github,
  Terminal,
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

  // Extract unique languages from project list
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    initialProjects.forEach((p) => {
      if (p.language) langs.add(p.language);
    });
    return ['ALL', ...Array.from(langs)];
  }, [initialProjects]);

  // Filter projects by search query and selected language
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLang =
        selectedLanguage === 'ALL' ||
        (p.language && p.language.toLowerCase() === selectedLanguage.toLowerCase());
      return matchesSearch && matchesLang;
    });
  }, [initialProjects, searchQuery, selectedLanguage]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[500px] h-[400px] bg-teal-500/8 rounded-full blur-[130px]" />
      </div>

      {/* Main Workspace Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <Sparkles size={12} />
              <span>Cloud Developer Environments</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Your Repositories & Workspaces
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Click any repository to launch a dedicated rootless microVM container with instant NVMe storage and live WebSockets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin/workspaces"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono tracking-wide text-white bg-red-600/80 hover:bg-red-500 border border-red-500/30 transition-all duration-200 shadow-lg shadow-red-600/20"
              >
                <Layers size={14} />
                <span>Admin Panel</span>
              </Link>
            )}
            <ImportButton />
            <NewProjectButton />
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Github size={13} className="text-emerald-400" />
              <span>Repositories</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">{initialProjects.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Zap size={13} className="text-amber-400" />
              <span>Cold Start</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">140ms</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Cpu size={13} className="text-blue-400" />
              <span>Runtime CPU</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">2 vCPU / Box</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Isolation</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">Strict MicroVM</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories by name or tech..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* Language Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
              <Filter size={12} /> Filter:
            </span>
            {availableLanguages.slice(0, 6).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 ${
                  selectedLanguage === lang
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Repositories Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <RepoCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 rounded-3xl bg-slate-900/40 border border-white/5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <FolderGit2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No repositories found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              {searchQuery
                ? `No repositories matched "${searchQuery}". Try clearing search or filter.`
                : 'Import a GitHub repository or create a new workspace project to get started.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLanguage('ALL');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Reset Filters
              </button>
              <NewProjectButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
