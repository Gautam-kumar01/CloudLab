'use client';

import React from 'react';
import { FileCode } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  icon: string;
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
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-animate-in w-full max-w-xl max-h-[460px] bg-[#090d1a] rounded-2xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Search Bar */}
        <div className="p-3 bg-[#0c1426] border-b border-white/10 flex items-center gap-3">
          <div className="text-emerald-400 font-mono text-sm pl-1">
            {mode === 'commands' ? '>' : '📁'}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              mode === 'commands'
                ? 'Type a command (e.g. Open Folder, Deploy, Git, Snapshots)...'
                : 'Search files by name (e.g. page.tsx, index.js)...'
            }
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-sans"
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode(mode === 'commands' ? 'files' : 'commands')}
              className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              {mode === 'commands' ? 'Switch to Files' : 'Switch to Commands'}
            </button>
            <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/5">
              ESC
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none scrollbar-thin scrollbar-thumb-slate-800">
          {mode === 'commands' ? (
            /* Commands Mode */
            commands
              .filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()))
              .map((cmd, idx) => (
                <div
                  key={cmd.id}
                  onClick={() => onExecuteCommand(cmd.id)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    idx === selectedIndex
                      ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <span>{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Run</span>
                </div>
              ))
          ) : (
            /* Quick Open Files Mode */
            (() => {
              const fileList: { path: string; name: string }[] = [];
              function collectFiles(nodeMap: any) {
                if (!nodeMap) return;
                Object.values(nodeMap).forEach((node: any) => {
                  if (node.type === 'file') {
                    fileList.push({ path: node.path, name: node.name || node.path });
                  }
                  if (node.children) collectFiles(node.children);
                });
              }
              collectFiles(fileTree);

              const filtered = fileList.filter(
                (f) =>
                  f.path.toLowerCase().includes(query.toLowerCase()) ||
                  f.name.toLowerCase().includes(query.toLowerCase())
              );

              if (filtered.length === 0) {
                return (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No matching files found for &quot;{query}&quot;
                  </div>
                );
              }

              return filtered.map((f, idx) => (
                <div
                  key={f.path}
                  onClick={() => {
                    onClose();
                    onOpenFile(f.path);
                  }}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    idx === selectedIndex
                      ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <FileCode size={14} className="text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white">{f.name}</span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                      {f.path}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Jump</span>
                </div>
              ));
            })()
          )}
        </div>
      </div>
    </div>
  );
}
