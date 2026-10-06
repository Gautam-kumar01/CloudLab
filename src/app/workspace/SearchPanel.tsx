'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Replace,
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  Loader2,
  Check,
  AlertCircle,
  FileCode,
  Sparkles,
  Layers,
  FoldVertical,
  UnfoldVertical,
} from 'lucide-react';
import FileIcon from './FileIcon';

interface SearchMatch {
  line: number;
  column: number;
  length: number;
  lineText: string;
}

interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}

interface SearchPanelProps {
  workspaceId: string;
  onNavigateToFile: (filePath: string, line: number, column: number) => void;
  onRefreshFiles?: () => void;
}

export default function SearchPanel({
  workspaceId,
  onNavigateToFile,
  onRefreshFiles,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [replace, setReplace] = useState('');
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [includePattern, setIncludePattern] = useState('');
  const [excludePattern, setExcludePattern] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FileSearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when panel is shown
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotalMatches(0);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        id: workspaceId,
        q: query,
        caseSensitive: matchCase ? 'true' : 'false',
        wholeWord: matchWholeWord ? 'true' : 'false',
        regex: isRegex ? 'true' : 'false',
      });

      if (includePattern.trim()) params.set('include', includePattern.trim());
      if (excludePattern.trim()) params.set('exclude', excludePattern.trim());

      const res = await fetch(`/api/workspace/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to search workspace');
      }

      const resFiles: FileSearchResult[] = data.data?.files || [];
      const total: number = data.data?.totalMatches || 0;

      setResults(resFiles);
      setTotalMatches(total);
      setHasSearched(true);
      setCollapsedFiles({});
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
      setTotalMatches(0);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, query, matchCase, matchWholeWord, isRegex, includePattern, excludePattern]);

  const handleReplaceAll = async (targetFile?: string) => {
    if (!query.trim()) return;

    const confirmMsg = targetFile
      ? `Replace all occurrences of "${query}" with "${replace}" in ${targetFile}?`
      : `Replace all ${totalMatches} occurrences of "${query}" across ${results.length} files with "${replace}"?`;

    if (!window.confirm(confirmMsg)) return;

    setIsReplacing(true);
    setError(null);

    try {
      const res = await fetch('/api/workspace/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          query,
          replace,
          matchCase,
          matchWholeWord,
          isRegex,
          replaceMode: targetFile ? 'file' : 'all',
          targetFile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Replace operation failed');
      }

      // Re-run search to refresh matches
      await handleSearch();
      if (onRefreshFiles) {
        onRefreshFiles();
      }
    } catch (err: any) {
      setError(err.message || 'Replace failed');
    } finally {
      setIsReplacing(false);
    }
  };

  const toggleCollapse = (filePath: string) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [filePath]: !prev[filePath],
    }));
  };

  const toggleCollapseAll = () => {
    const allCollapsed = results.every((r) => collapsedFiles[r.filePath]);
    const newState: Record<string, boolean> = {};
    if (!allCollapsed) {
      results.forEach((r) => {
        newState[r.filePath] = true;
      });
    }
    setCollapsedFiles(newState);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Helper to highlight match within lineText
  const renderHighlightedSnippet = (text: string, matchLen: number, col: number) => {
    const startIndex = Math.max(0, col - 1);
    const endIndex = startIndex + matchLen;

    const before = text.slice(0, startIndex);
    const match = text.slice(startIndex, endIndex);
    const after = text.slice(endIndex);

    return (
      <span className="truncate">
        <span>{before}</span>
        <mark
          style={{
            background: 'rgba(245, 158, 11, 0.35)',
            color: '#fbbf24',
            padding: '1px 3px',
            borderRadius: '2px',
            fontWeight: 600,
          }}
        >
          {match || query}
        </mark>
        <span>{after}</span>
      </span>
    );
  };

  return (
    <div
      className="cloudlab-panel flex flex-col h-full overflow-hidden select-none"
      style={{
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
      }}
    >
      {/* Top Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Search
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {results.length > 0 && (
            <button
              type="button"
              onClick={toggleCollapseAll}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Toggle collapse all files"
            >
              <FoldVertical size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded transition-colors ${
              showFilters || includePattern || excludePattern
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle include/exclude file filters"
          >
            <Filter size={13} />
          </button>
        </div>
      </div>

      {/* Search & Replace Form */}
      <div className="p-3 space-y-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {/* Search Row */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsReplaceOpen(!isReplaceOpen)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle Replace"
          >
            <ChevronRight
              size={13}
              className={`transform transition-transform ${isReplaceOpen ? 'rotate-90' : ''}`}
            />
          </button>
          <div
            className="flex-1 flex items-center rounded-md border px-2 py-1 gap-1.5 bg-[#0a0f1d] focus-within:border-cyan-500/50 transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search in files..."
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={12} />
              </button>
            )}
            <div className="flex items-center gap-0.5 border-l border-white/10 pl-1.5">
              <button
                type="button"
                onClick={() => setMatchCase(!matchCase)}
                className={`px-1 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  matchCase ? 'bg-cyan-500/25 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Match Case (Aa)"
              >
                Aa
              </button>
              <button
                type="button"
                onClick={() => setMatchWholeWord(!matchWholeWord)}
                className={`px-1 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  matchWholeWord ? 'bg-cyan-500/25 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Match Whole Word (\b)"
              >
                \b
              </button>
              <button
                type="button"
                onClick={() => setIsRegex(!isRegex)}
                className={`px-1 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  isRegex ? 'bg-cyan-500/25 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Use Regular Expression (.*)"
              >
                .*
              </button>
            </div>
          </div>
        </div>

        {/* Replace Row */}
        {isReplaceOpen && (
          <div className="flex items-center gap-1.5 pl-5">
            <div
              className="flex-1 flex items-center rounded-md border px-2 py-1 gap-1.5 bg-[#0a0f1d] focus-within:border-amber-500/50 transition-colors"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <input
                type="text"
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replace with..."
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              {replace && (
                <button
                  type="button"
                  onClick={() => setReplace('')}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={isReplacing || results.length === 0}
              onClick={() => handleReplaceAll()}
              className="px-2 py-1 text-xs rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              title="Replace All in Workspace"
            >
              {isReplacing ? <Loader2 size={12} className="animate-spin" /> : <Replace size={12} />}
              <span>All</span>
            </button>
          </div>
        )}

        {/* Filters Row */}
        {showFilters && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Files to include
              </label>
              <input
                type="text"
                value={includePattern}
                onChange={(e) => setIncludePattern(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. *.ts, src/**"
                className="w-full rounded border px-2 py-1 text-xs bg-[#0a0f1d] border-white/10 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/40"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Files to exclude
              </label>
              <input
                type="text"
                value={excludePattern}
                onChange={(e) => setExcludePattern(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. *.min.js, dist/**"
                className="w-full rounded border px-2 py-1 text-xs bg-[#0a0f1d] border-white/10 text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>
        )}

        {/* Search Submit Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400">
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Loader2 size={11} className="animate-spin" /> Searching...
              </span>
            ) : hasSearched ? (
              <span>
                {totalMatches} result{totalMatches === 1 ? '' : 's'} in {results.length} file
                {results.length === 1 ? '' : 's'}
              </span>
            ) : (
              <span>Press Enter to search</span>
            )}
          </div>
          <button
            type="button"
            disabled={isLoading || !query.trim()}
            onClick={handleSearch}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            <span>Find</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Results Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 text-slate-500">
            <Search size={32} className="stroke-[1.5] mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">Search across workspace</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports case matching, regex, and instant file jumps.
            </p>
          </div>
        )}

        {hasSearched && results.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 text-slate-500">
            <AlertCircle size={28} className="stroke-[1.5] mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">No results found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              No occurrences of "{query}" matched the criteria.
            </p>
          </div>
        )}

        {results.map((file) => {
          const isCollapsed = collapsedFiles[file.filePath];
          const filename = file.filePath.split('/').pop() || file.filePath;

          return (
            <div
              key={file.filePath}
              className="rounded-lg border border-white/[0.05] bg-[#0c1426]/60 overflow-hidden"
            >
              {/* File Header Row */}
              <div
                onClick={() => toggleCollapse(file.filePath)}
                className="flex items-center justify-between px-2.5 py-1.5 bg-[#0f1930] hover:bg-[#142345] cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={file.filePath}>
                  {isCollapsed ? <ChevronRight size={13} className="text-slate-500 shrink-0" /> : <ChevronDown size={13} className="text-slate-500 shrink-0" />}
                  <FileIcon filename={filename} isDirectory={false} size={14} />
                  <span className="font-semibold text-slate-200 truncate">{filename}</span>
                  <span className="text-[10px] text-slate-500 truncate">
                    {file.filePath.includes('/') ? file.filePath.substring(0, file.filePath.lastIndexOf('/')) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {file.matches.length}
                  </span>
                  {isReplaceOpen && (
                    <button
                      type="button"
                      disabled={isReplacing}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplaceAll(file.filePath);
                      }}
                      className="p-1 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors"
                      title={`Replace in ${filename}`}
                    >
                      <Replace size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Match Lines */}
              {!isCollapsed && (
                <div className="divide-y divide-white/[0.03]">
                  {file.matches.map((m, idx) => (
                    <div
                      key={`${file.filePath}-${m.line}-${m.column}-${idx}`}
                      onClick={() => onNavigateToFile(file.filePath, m.line, m.column)}
                      className="group flex items-start gap-2 px-2.5 py-1.5 hover:bg-[#132140] cursor-pointer transition-colors text-xs font-mono"
                    >
                      <span className="text-[11px] text-slate-500 shrink-0 select-none w-8 text-right group-hover:text-cyan-400 transition-colors">
                        {m.line}:
                      </span>
                      <div className="flex-1 text-[11.5px] text-slate-300 group-hover:text-white transition-colors overflow-hidden leading-relaxed">
                        {renderHighlightedSnippet(m.lineText, m.length, m.column)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
