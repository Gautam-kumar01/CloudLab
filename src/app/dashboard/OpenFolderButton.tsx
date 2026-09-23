'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Loader2,
  X,
  Upload,
  FolderTree,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  HardDrive,
  FileCode,
} from 'lucide-react';

interface UploadProgress {
  total: number;
  current: number;
  stage: 'scanning' | 'reading' | 'uploading' | 'done';
}

export default function OpenFolderButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');

  // Read files from HTML5 showDirectoryPicker
  const handleOpenDirectoryPicker = async () => {
    setErrorMsg(null);
    try {
      if (!('showDirectoryPicker' in window)) {
        // Fallback to standard input
        fileInputRef.current?.click();
        return;
      }

      const dirHandle = await (window as any).showDirectoryPicker();
      if (!dirHandle) return;

      const name = dirHandle.name;
      setFolderName(name);
      setIsOpen(true);
      setIsProcessing(true);
      setProgress({ total: 0, current: 0, stage: 'scanning' });

      const files: { path: string; content: string; isBinary?: boolean }[] = [];

      // Recursive scanner
      async function scanDirectory(handle: any, currentPath = '') {
        for await (const entry of handle.values()) {
          const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

          // Skip heavy/system folders
          if (
            entry.name === '.git' ||
            entry.name === 'node_modules' ||
            entry.name === '.next' ||
            entry.name === 'dist' ||
            entry.name === '.turbo' ||
            entry.name === '__pycache__'
          ) {
            continue;
          }

          if (entry.kind === 'file') {
            const file = await entry.getFile();
            // Limit file size (max 5MB per file for safety)
            if (file.size < 5 * 1024 * 1024) {
              const isBinary = isBinaryFile(file.name);
              if (isBinary) {
                const arrayBuffer = await file.arrayBuffer();
                const base64 = btoa(
                  new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                files.push({ path: entryPath, content: base64, isBinary: true });
              } else {
                const text = await file.text();
                files.push({ path: entryPath, content: text });
              }
            }
          } else if (entry.kind === 'directory') {
            await scanDirectory(entry, entryPath);
          }
        }
      }

      await scanDirectory(dirHandle);

      if (files.length === 0) {
        setErrorMsg('The selected folder does not contain any readable files.');
        setIsProcessing(false);
        return;
      }

      setProgress({ total: files.length, current: files.length, stage: 'uploading' });

      // Send to server
      const res = await fetch('/api/workspace/upload-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: name, files }),
      });

      const data = await res.json();
      if (res.ok && data.project?.id) {
        setProgress({ total: files.length, current: files.length, stage: 'done' });
        router.push(`/workspace?id=${encodeURIComponent(data.project.id)}`);
      } else {
        setErrorMsg(data.error || 'Failed to import folder to workspace');
        setIsProcessing(false);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Directory picker error:', err);
        setErrorMsg(err.message || 'Error opening desktop folder');
      }
      setIsProcessing(false);
    }
  };

  // Fallback for standard directory input
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsOpen(true);
    setIsProcessing(true);
    setErrorMsg(null);

    const firstFile = fileList[0];
    const detectedName = firstFile.webkitRelativePath.split('/')[0] || 'imported-desktop-folder';
    setFolderName(detectedName);
    setProgress({ total: fileList.length, current: 0, stage: 'reading' });

    try {
      const files: { path: string; content: string; isBinary?: boolean }[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const relativePath = file.webkitRelativePath.replace(`${detectedName}/`, '');

        // Skip ignored directories
        if (
          relativePath.startsWith('.git/') ||
          relativePath.includes('/.git/') ||
          relativePath.startsWith('node_modules/') ||
          relativePath.includes('/node_modules/') ||
          relativePath.startsWith('.next/') ||
          relativePath.startsWith('dist/')
        ) {
          continue;
        }

        if (file.size < 5 * 1024 * 1024) {
          const isBinary = isBinaryFile(file.name);
          if (isBinary) {
            const arrayBuffer = await file.arrayBuffer();
            const base64 = btoa(
              new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            files.push({ path: relativePath, content: base64, isBinary: true });
          } else {
            const text = await file.text();
            files.push({ path: relativePath, content: text });
          }
        }
        setProgress({ total: fileList.length, current: i + 1, stage: 'reading' });
      }

      setProgress({ total: files.length, current: files.length, stage: 'uploading' });

      const res = await fetch('/api/workspace/upload-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: detectedName, files }),
      });

      const data = await res.json();
      if (res.ok && data.project?.id) {
        router.push(`/workspace?id=${encodeURIComponent(data.project.id)}`);
      } else {
        setErrorMsg(data.error || 'Failed to upload folder');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('File input upload error:', err);
      setErrorMsg('Error processing folder files');
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Hidden File Input for fallback */}
      <input
        type="file"
        ref={fileInputRef}
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenDirectoryPicker}
        className="btn-secondary-glow group flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold tracking-wide cursor-pointer transition-all"
        title="Open any local folder on your computer like VS Code"
      >
        <div className="w-6 h-6 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-black transition-all duration-200">
          <FolderOpen size={14} strokeWidth={2.5} />
        </div>
        <span className="text-white font-medium">Open Folder</span>
        <span className="hidden md:inline-flex items-center text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-teal-300 border border-teal-500/20 group-hover:border-teal-400/40 transition-colors">
          Desktop
        </span>
      </button>

      {/* Progress & Status Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="modal-animate-in w-full max-w-md rounded-2xl bg-[#090d1a] border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(20,184,166,0.15)] overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500" />

            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-md">
                    <FolderTree size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Importing Desktop Folder</h3>
                    <p className="text-xs text-slate-400 truncate max-w-[240px] font-mono mt-0.5">
                      {folderName || 'Selected Folder'}
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {errorMsg ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <span className="leading-relaxed font-medium">{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/80 border border-white/10">
                    <Loader2 size={22} className="animate-spin text-teal-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white capitalize">
                        {progress?.stage === 'scanning' && 'Scanning directory tree...'}
                        {progress?.stage === 'reading' && `Reading files (${progress.current}/${progress.total})...`}
                        {progress?.stage === 'uploading' && `Initializing workspace (${progress.total} files)...`}
                        {progress?.stage === 'done' && 'Opening CloudLab IDE...'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Transferring files into isolated microVM storage
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <HardDrive size={13} className="text-teal-400" />
                      <span>Local NVMe Sync</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <FileCode size={13} className="text-emerald-400" />
                      <span>Auto Git Repo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function isBinaryFile(filename: string): boolean {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf',
    '.zip', '.tar', '.gz', '.mp3', '.mp4', '.woff', '.woff2',
    '.ttf', '.eot', '.exe', '.dll', '.so', '.dylib', '.bin'
  ];
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return binaryExtensions.includes(ext);
}
