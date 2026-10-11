'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { FileCode } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  icon: string;
  keywords?: string[];
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'commands' | 'files';
  setMode: (mode: 'commands' | 'files') => void;
  query: string;
  setQuery: (q: string) => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  commands: CommandItem[];
  fileTree: Record<string, any>;
  onExecuteCommand: (id: string) => void;
  onOpenFile: (path: string) => void;
}

interface PaletteFile {
  path: string;
  name: string;
}

function flattenFiles(nodeMap: Record<string, any> | undefined): PaletteFile[] {
  const files: PaletteFile[] = [];
  const visit = (nodes: Record<string, any> | undefined) => {
    if (!nodes) return;
    Object.values(nodes).forEach((node: any) => {
      if (node?.type === 'file' && typeof node.path === 'string') {
        files.push({ path: node.path, name: node.name || node.path });
      }
      if (node?.children) visit(node.children);
    });
  };
  visit(nodeMap);
  return files;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  mode,
  setMode,
  query,
  setQuery,
  selectedIndex,
  setSelectedIndex,
  commands,
  fileTree,
  onExecuteCommand,
  onOpenFile,
}: CommandPaletteModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCommands = useMemo(
    () => commands.filter((command) =>
      `${command.label} ${command.id} ${(command.keywords || []).join(' ')}`.toLowerCase().includes(normalizedQuery),
    ),
    [commands, normalizedQuery],
  );
  const filteredFiles = useMemo(
    () => flattenFiles(fileTree).filter((file) =>
      `${file.name} ${file.path}`.toLowerCase().includes(normalizedQuery),
    ),
    [fileTree, normalizedQuery],
  );
  const optionCount = mode === 'commands' ? filteredCommands.length : filteredFiles.length;
  const activeOptionId = optionCount > 0 ? `cloudlab-palette-option-${selectedIndex}` : undefined;

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen, mode]);

  useEffect(() => {
    if (selectedIndex >= optionCount) setSelectedIndex(Math.max(0, optionCount - 1));
    if (selectedIndex < 0) setSelectedIndex(0);
    const activeOption = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (activeOption && typeof activeOption.scrollIntoView === 'function') {
      activeOption.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, optionCount, setSelectedIndex]);

  if (!isOpen) return null;

  const selectOption = (index: number) => {
    if (mode === 'commands') {
      const command = filteredCommands[index];
      if (command) onExecuteCommand(command.id);
      return;
    }
    const file = filteredFiles[index];
    if (file) {
      onClose();
      onOpenFile(file.path);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && optionCount > 0) {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((selectedIndex + 1) % optionCount);
    } else if (event.key === 'ArrowUp' && optionCount > 0) {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((selectedIndex - 1 + optionCount) % optionCount);
    } else if (event.key === 'Enter' && optionCount > 0) {
      event.preventDefault();
      event.stopPropagation();
      selectOption(selectedIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };

  const changeMode = () => {
    setMode(mode === 'commands' ? 'files' : 'commands');
    setQuery('');
    setSelectedIndex(0);
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (optionCount === 0 || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    setSelectedIndex(event.key === 'ArrowDown'
      ? (selectedIndex + 1) % optionCount
      : (selectedIndex - 1 + optionCount) % optionCount);
    inputRef.current?.focus();
  };

  return (
    <div
      data-command-palette
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloudlab-palette-title"
        onKeyDown={handleDialogKeyDown}
        onClick={(event) => event.stopPropagation()}
        className="modal-animate-in w-full max-w-xl max-h-[460px] bg-[#090d1a] rounded-2xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden"
      >
        <h2 id="cloudlab-palette-title" className="sr-only">
          {mode === 'commands' ? 'Command Palette' : 'Quick Open Files'}
        </h2>
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        <div className="p-3 bg-[#0c1426] border-b border-white/10 flex items-center gap-3">
          <div aria-hidden="true" className="text-emerald-400 font-mono text-sm pl-1">
            {mode === 'commands' ? '>' : '📁'}
          </div>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={mode === 'commands' ? 'Search commands' : 'Search files'}
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="cloudlab-palette-results"
            aria-activedescendant={activeOptionId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={mode === 'commands'
              ? 'Search commands (e.g. preview, terminal, snapshot)…'
              : 'Search files by name (e.g. page.tsx, index.js)…'}
            autoComplete="off"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-sans"
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={changeMode}
              className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              {mode === 'commands' ? 'Switch to Files' : 'Switch to Commands'}
            </button>
            <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/5">ESC</span>
          </div>
        </div>

        <div
          ref={listRef}
          id="cloudlab-palette-results"
          role="listbox"
          aria-label={mode === 'commands' ? 'Available commands' : 'Workspace files'}
          className="flex-1 overflow-y-auto p-2 space-y-1 select-none scrollbar-thin scrollbar-thumb-slate-800"
        >
          {mode === 'commands' ? (
            filteredCommands.length > 0 ? filteredCommands.map((command, index) => (
              <button
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                id={`cloudlab-palette-option-${index}`}
                key={command.id}
                onFocus={() => setSelectedIndex(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                onKeyDown={handleOptionKeyDown}
                onClick={() => selectOption(index)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${index === selectedIndex
                  ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
              >
                <span className="flex items-center gap-2.5 text-xs font-medium">
                  <span aria-hidden="true">{command.icon}</span>
                  <span>{command.label}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Run</span>
              </button>
            )) : (
              <div className="p-6 text-center text-xs text-slate-500" role="status">No matching commands.</div>
            )
          ) : filteredFiles.length > 0 ? filteredFiles.map((file, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              id={`cloudlab-palette-option-${index}`}
              key={file.path}
              onFocus={() => setSelectedIndex(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              onKeyDown={handleOptionKeyDown}
              onClick={() => selectOption(index)}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${index === selectedIndex
                ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              <span className="flex items-center gap-2 text-xs font-mono min-w-0">
                <FileCode size={14} className="text-emerald-400 shrink-0" />
                <span className="font-semibold text-white shrink-0">{file.name}</span>
                <span className="text-[11px] text-slate-500 truncate">{file.path}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Open</span>
            </button>
          )) : (
            <div className="p-6 text-center text-xs text-slate-500" role="status">
              No matching files{query ? ` for “${query}”` : ''}.
            </div>
          )}
        </div>
        <div className="px-3 py-2 border-t border-white/10 text-[10px] text-slate-500 flex justify-between">
          <span>↑↓ navigate · Enter select</span>
          <span>Ctrl/Cmd+K commands · Ctrl/Cmd+P files</span>
        </div>
      </div>
    </div>
  );
}
