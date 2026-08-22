'use client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import {
  Folder,
  FileCode,
  FileJson,
  FileType2,
  Terminal as TerminalIcon,
  Play,
  Share,
  Settings,
  Code2,
  MessageSquare,
  AlertCircle,
  FilePlus,
  FolderPlus,
  RefreshCw,
  ChevronsDown,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash,
  SplitSquareHorizontal,
  ChevronDown as ChevronDownIcon,
  GitBranch,
  Files,
  Globe,
  Rocket,
  Upload,
  Download,
} from 'lucide-react';

import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import GitPanel from './GitPanel';
import AiChatPanel from './AiChatPanel';
import PreviewPanel from './PreviewPanel';
import DeploymentPanel from './DeploymentPanel';
const FileTreeNode = ({
  node,
  level,
  expandedFolders,
  setExpandedFolders,
  activeFile,
  openFile,
  onContextMenu,
  selectedNodePath,
  setSelectedNodePath,
}: any) => {
  const isExpanded = expandedFolders[node.path];
  const isSelected = selectedNodePath === node.path;

  const toggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodePath(node.path);
    setExpandedFolders((prev: any) => ({ ...prev, [node.path]: !prev[node.path] }));
  };

  const getFileIcon = (filename: string) => {
    if (!filename) return <FileCode size={14} color="#888" />;
    if (filename.endsWith('.ts') || filename.endsWith('.tsx'))
      return <FileCode size={14} color="#61dafb" />;
    if (filename.endsWith('.json')) return <FileJson size={14} color="#f1e05a" />;
    if (filename.endsWith('.css')) return <FileType2 size={14} color="#563d7c" />;
    return <FileCode size={14} color="#888" />;
  };

  if (node.type === 'directory') {
    return (
      <div style={{ userSelect: 'none' }}>
        <div
          onClick={toggleFolder}
          onContextMenu={(e) => {
            setSelectedNodePath(node.path);
            onContextMenu(e, node);
          }}
          style={{
            padding: '4px 8px',
            paddingLeft: `${level * 12 + 8}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            background: isSelected ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
            outline: isSelected ? '1px solid var(--accent-orange)' : 'none',
            outlineOffset: '-1px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => {
            if (!isSelected) e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} color="#dcb67a" fill="#dcb67a" />
          {node.name}
        </div>
        {isExpanded && node.children && (
          <div>
            {Object.values(node.children).map((child: any, idx) => (
              <FileTreeNode
                key={child.path || idx}
                node={child}
                level={level + 1}
                expandedFolders={expandedFolders}
                setExpandedFolders={setExpandedFolders}
                activeFile={activeFile}
                openFile={openFile}
                onContextMenu={onContextMenu}
                selectedNodePath={selectedNodePath}
                setSelectedNodePath={setSelectedNodePath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setSelectedNodePath(node.path);
        openFile(node.path, node);
      }}
      onContextMenu={(e) => {
        setSelectedNodePath(node.path);
        onContextMenu(e, node);
      }}
      style={{
        padding: '4px 8px',
        paddingLeft: `${level * 12 + 8 + 20}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: activeFile === node.path ? 'var(--text-primary)' : 'var(--text-secondary)',
        background:
          activeFile === node.path
            ? 'var(--bg-secondary)'
            : isSelected
              ? 'rgba(255, 165, 0, 0.1)'
              : 'transparent',
        outline: isSelected ? '1px solid var(--accent-orange)' : 'none',
        outlineOffset: '-1px',
        fontSize: '0.85rem',
      }}
      onMouseOver={(e) => {
        if (activeFile !== node.path && !isSelected) {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseOut={(e) => {
        if (activeFile !== node.path && !isSelected) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {getFileIcon(node.name)}
      {node.name}
    </div>
  );
};

export default function Workspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceId = searchParams.get('id') || '2';

  const [fileTree, setFileTree] = useState<Record<string, any>>({});
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<
    Record<string, { name: string; language: string; content: string }>
  >({});
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'git' | 'deploy'>('explorer');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
    type: 'file' | 'directory';
    isRoot?: boolean;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 0, quotaBytes: 500 * 1024 * 1024 });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<string>('');

  // Yjs Refs
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<any | null>(null);
  const editorRef = useRef<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((s) => setSessionUser(s?.user));
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, node?: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (node) {
      setContextMenu({ x: e.clientX, y: e.clientY, path: node.path, type: node.type });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, path: '', type: 'directory', isRoot: true });
    }
  };

  const resolveTargetFolder = (): string => {
    if (!selectedNodePath) return '';
    const findNode = (tree: any, path: string): any => {
      for (const key in tree) {
        if (tree[key].path === path) return tree[key];
        if (tree[key].children) {
          const found = findNode(tree[key].children, path);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(fileTree, selectedNodePath);
    if (!node) return '';
    if (node.type === 'directory') return node.path;
    const lastSlash = node.path.lastIndexOf('/');
    return lastSlash >= 0 ? node.path.substring(0, lastSlash) : '';
  };

  type TerminalState = { id: string; title: string; shellType: string };
  const [terminals, setTerminals] = useState<TerminalState[]>([
    { id: 'term-1', title: 'powershell', shellType: 'powershell' },
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('term-1');

  const socketRef = useRef<Socket | null>(null);
  const xtermInstances = useRef<
    Record<string, { term: XTerm; fitAddon: FitAddon; container: HTMLDivElement }>
  >({});
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openFile = async (path: string, node: any) => {
    if (files[path]) {
      setActiveFile(path);
      return;
    }

    // Immediately open tab with loading state
    setFiles((prev) => ({
      ...prev,
      [path]: { name: node.name, language: node.language, content: '// Loading...' },
    }));
    setActiveFile(path);

    try {
      const res = await fetch(
        `/api/workspace/file?id=${encodeURIComponent(workspaceId)}&filename=${encodeURIComponent(path)}`,
      );
      const data = await res.json();
      if (data.content !== undefined) {
        setFiles((prev) => ({
          ...prev,
          [path]: { name: node.name, language: node.language, content: data.content },
        }));
      }
    } catch (e) {
      console.error(e);
      setFiles((prev) => ({
        ...prev,
        [path]: { name: node.name, language: node.language, content: '// Failed to load file' },
      }));
    }
  };

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`/api/workspace/files?id=${encodeURIComponent(workspaceId)}`);
      const responseBody = await res.json();
      const data = responseBody.data || responseBody;
      if (responseBody.error) {
        setWorkspaceError(responseBody.error.message || 'Failed to load workspace files');
        return;
      }
      if (!responseBody.error) {
        setFileTree(data);
        if (data['index.ts'] && data['index.ts'].type === 'file') {
          openFile('index.ts', data['index.ts']);
        } else {
          const firstKey = Object.keys(data).find((k) => data[k].type === 'file');
          if (firstKey) openFile(firstKey, data[firstKey]);
        }
      }

      const storageRes = await fetch(
        `/api/workspace/storage?id=${encodeURIComponent(workspaceId)}`,
      );
      const storageData = await storageRes.json();
      if (!storageData.error) {
        setStorageUsage({ usedBytes: storageData.usedBytes, quotaBytes: storageData.quotaBytes });
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  // Fetch initial files from API
  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  // Helper function to get language for new files
  const getLanguage = (fname: string) => {
    if (fname.endsWith('.ts') || fname.endsWith('.tsx')) return 'typescript';
    if (fname.endsWith('.js') || fname.endsWith('.jsx')) return 'javascript';
    if (fname.endsWith('.json')) return 'json';
    if (fname.endsWith('.css')) return 'css';
    if (fname.endsWith('.html')) return 'html';
    if (fname.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const handleSave = async (specificFile?: string, specificContent?: string) => {
    const fileToSave = specificFile || activeFile;
    if (!fileToSave || !files[fileToSave]) return;

    setIsSaving(true);
    try {
      await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          filename: fileToSave,
          content: specificContent !== undefined ? specificContent : files[fileToSave].content,
        }),
      });
      console.log('Saved', fileToSave);
      if (!specificFile) setActiveMenu(null); // Close menu if open manually
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewFile = async (basePath: string = '') => {
    const filename = prompt(
      `Enter new filename (e.g., component.tsx) ${basePath ? 'inside ' + basePath : 'in root'}:`,
    );
    if (!filename) return;

    const fullPath = basePath ? `${basePath}/${filename}` : filename;
    try {
      await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          filename: fullPath,
          content: '',
          isDir: false,
        }),
      });
      await fetchWorkspace();
      setActiveMenu(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewFolder = async (basePath: string = '') => {
    const foldername = prompt(
      `Enter new folder name ${basePath ? 'inside ' + basePath : 'in root'}:`,
    );
    if (!foldername) return;

    const fullPath = basePath ? `${basePath}/${foldername}/` : `${foldername}/`;
    try {
      await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          filename: fullPath,
          content: '',
          isDir: true,
        }),
      });
      await fetchWorkspace();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFile = async (targetPath?: string) => {
    const fileToDelete = targetPath || activeFile;
    if (!fileToDelete) return;
    if (!confirm(`Are you sure you want to delete ${fileToDelete}?`)) return;

    try {
      await fetch(
        `/api/workspace/files?id=${encodeURIComponent(workspaceId)}&filename=${encodeURIComponent(fileToDelete)}`,
        {
          method: 'DELETE',
        },
      );

      setFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[fileToDelete];
        return newFiles;
      });

      // Select another open file if the active one was deleted
      const remainingFiles = Object.keys(files).filter((f) => f !== fileToDelete);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0]);
      } else {
        setActiveFile('');
      }

      await fetchWorkspace();
      setActiveMenu(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete file');
    }
  };

  const handleRenameFile = async (oldPath: string) => {
    if (!oldPath) return;
    const nameOnly = oldPath.split('/').pop() || oldPath;
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));

    const newName = prompt(`Enter new name for ${nameOnly}:`, nameOnly);
    if (!newName || newName === nameOnly) return;

    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    try {
      await fetch('/api/workspace/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, oldPath, newPath }),
      });

      // Update local state if it was open
      if (files[oldPath]) {
        setFiles((prev) => {
          const newFiles = { ...prev };
          newFiles[newPath] = { ...newFiles[oldPath], name: newName };
          delete newFiles[oldPath];
          return newFiles;
        });
        if (activeFile === oldPath) setActiveFile(newPath);
      }

      await fetchWorkspace();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadFile = (targetPath: string) => {
    if (!targetPath) return;
    window.location.href = `/api/workspace/download?id=${encodeURIComponent(workspaceId)}&filename=${encodeURIComponent(targetPath)}`;
    setContextMenu(null);
  };

  const handleUploadFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size + storageUsage.usedBytes > storageUsage.quotaBytes) {
      alert(`Upload failed: This file exceeds your workspace storage quota.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch(
      `/api/workspace/upload?id=${encodeURIComponent(workspaceId)}&path=${encodeURIComponent(uploadTargetFolder)}`,
      {
        method: 'POST',
        body: formData,
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert('Upload failed: ' + data.error);
        } else {
          fetchWorkspace();
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Upload failed');
      })
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  const handleUploadTrigger = (targetPath: string) => {
    setUploadTargetFolder(targetPath);
    setContextMenu(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGitPush = async () => {
    const message = prompt('Enter commit message:');
    if (message === null) return;

    try {
      setIsSaving(true); // Reusing isSaving to show network activity
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, message }),
      });
      const data = await res.json();
      if (data.error) {
        alert('Git push failed: ' + data.error);
      } else {
        alert('Successfully pushed to GitHub!\n' + (data.message || ''));
      }
    } catch (err: any) {
      alert('Git push failed: ' + err.message);
    } finally {
      setIsSaving(false);
      setActiveMenu(null);
    }
  };

  // Handle Save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser save dialog
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, files]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleMenuClick = (e: React.MouseEvent, menu: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  useEffect(() => {
    // 1. Initialize Socket.io with explicit reconnect/backoff
    const socket = io({
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on('terminal.incData', ({ id, data }) => {
      if (xtermInstances.current[id]) {
        xtermInstances.current[id].term.write(data);
      }
    });

    const handleResize = () => {
      if (activeBottomTab === 'terminal' && xtermInstances.current[activeTerminalId]) {
        xtermInstances.current[activeTerminalId].fitAddon.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      socket.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Spawn initial terminal
  useEffect(() => {
    if (socketRef.current) {
      // Spawn term-1 if it's the first time
      socketRef.current.emit('terminal.spawn', {
        id: 'term-1',
        shellType: 'powershell',
        workspaceId,
      });
    }
  }, [workspaceId]);

  // Terminal DOM attachment via callback ref
  const terminalRef = (id: string) => (node: HTMLDivElement | null) => {
    if (node && !xtermInstances.current[id]) {
      const term = new XTerm({
        theme: {
          background: '#111111',
          foreground: '#e0e0e0',
          cursor: '#00ff41',
        },
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(node);
      fitAddon.fit();

      term.onData((data) => {
        socketRef.current?.emit('terminal.toTerm', { id, data });
      });

      xtermInstances.current[id] = { term, fitAddon, container: node };
    }
  };

  // Re-fit terminal when switching tabs
  useEffect(() => {
    if (activeBottomTab === 'terminal' && xtermInstances.current[activeTerminalId]) {
      setTimeout(() => {
        xtermInstances.current[activeTerminalId].fitAddon.fit();
      }, 50);
    }
  }, [activeBottomTab, activeTerminalId]);

  const handleNewTerminal = (shellType: string = 'powershell') => {
    const id = `term-${Date.now()}`;
    setTerminals((prev) => [...prev, { id, title: shellType, shellType }]);
    setActiveTerminalId(id);
    setActiveBottomTab('terminal');
    socketRef.current?.emit('terminal.spawn', { id, shellType, workspaceId });
  };

  const handleKillTerminal = (id: string) => {
    socketRef.current?.emit('terminal.kill', { id });
    setTerminals((prev) => {
      const newTerms = prev.filter((t) => t.id !== id);
      if (newTerms.length > 0 && activeTerminalId === id) {
        setActiveTerminalId(newTerms[newTerms.length - 1].id);
      }
      return newTerms;
    });
    if (xtermInstances.current[id]) {
      xtermInstances.current[id].term.dispose();
      delete xtermInstances.current[id];
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles((prev) => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content: value },
      }));

      // In Yjs mode, we don't save to the backend manually using POST /api/workspace/files on every change
      // The server will handle saving directly from the Yjs document state.
    }
  };

  const handleRunCommand = () => {
    setActiveBottomTab('terminal');
    if (socketRef.current && activeFile) {
      if (activeFile.endsWith('.ts') || activeFile.endsWith('.js')) {
        socketRef.current.emit('terminal.toTerm', `node ${activeFile}\r`);
      } else if (activeFile.endsWith('.py')) {
        socketRef.current.emit('terminal.toTerm', `python3 ${activeFile}\r`);
      } else {
        socketRef.current.emit('terminal.toTerm', `cat ${activeFile}\r`);
      }
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx'))
      return <FileCode size={14} color="#61dafb" />;
    if (filename.endsWith('.json')) return <FileJson size={14} color="#f1e05a" />;
    if (filename.endsWith('.css')) return <FileType2 size={14} color="#563d7c" />;
    return <FileCode size={14} color="#888" />;
  };

  const handleEditorDidMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Dynamically import y-monaco only on the client side
    const { MonacoBinding } = await import('y-monaco');

    // Cleanup previous Yjs state if any
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    if (activeFile) {
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/collaboration`;

      const provider = new WebsocketProvider(
        wsUrl,
        `workspace/${workspaceId}/file/${encodeURIComponent(activeFile)}`,
        ydoc,
        {
          connect: true,
          params: { workspaceId, file: activeFile },
        },
      );
      providerRef.current = provider;

      provider.awareness.setLocalStateField('user', {
        name: sessionUser?.name || 'Anonymous',
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      });

      provider.awareness.on('change', () => {
        const states = Array.from(provider.awareness.getStates().values());
        setCollaborators(states.filter((state: any) => state.user));
      });

      const ytext = ydoc.getText('monaco');
      const binding = new MonacoBinding(
        ytext,
        editor.getModel(),
        new Set([editor]),
        provider.awareness,
      );
      bindingRef.current = binding;
    }

    editor.addAction({
      id: 'ai-explain-code',
      label: 'Explain Code (CloudLab AI)',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function (ed: any) {
        const selection = ed.getSelection();
        const text = ed.getModel().getValueInRange(selection);
        if (text) {
          const event = new CustomEvent('ai-action', {
            detail: { action: 'explain', text, context: activeFile },
          });
          window.dispatchEvent(event);
        } else {
          alert('Please select some code to explain.');
        }
      },
    });

    editor.addAction({
      id: 'ai-fix-error',
      label: 'Fix Error (CloudLab AI)',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.6,
      run: function (ed: any) {
        const selection = ed.getSelection();
        const text = ed.getModel().getValueInRange(selection);
        if (text) {
          const event = new CustomEvent('ai-action', {
            detail: { action: 'fix', text, context: activeFile },
          });
          window.dispatchEvent(event);
        } else {
          alert('Please select some code to fix.');
        }
      },
    });
  };

  useEffect(() => {
    // When activeFile changes, we re-trigger handleEditorDidMount manually if the editor is already mounted
    if (editorRef.current && activeFile) {
      handleEditorDidMount(editorRef.current, null);
    }
  }, [activeFile, sessionUser]);

  return (
    <>
      {/* Mobile Warning Overlay */}
      <div
        className="mobile-warning"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-primary)',
          zIndex: 100,
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
        <h2
          style={{
            fontSize: '1.5rem',
            color: 'var(--accent-orange)',
            marginBottom: '8px',
            fontWeight: 'bold',
          }}
        >
          Desktop Required
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          The CloudLab IDE Shell is optimized for laptop and desktop screens. Please resize your
          window or switch to a larger device.
        </p>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-warning {
            display: flex !important;
          }
          .workspace-container {
            display: none !important;
          }
        }
        .resize-handle {
          background-color: var(--border-color);
          transition: background-color 0.2s ease;
        }
        .resize-handle:hover,
        .resize-handle:active {
          background-color: var(--accent-green);
        }
        .xterm .xterm-viewport {
          /* Hide scrollbar for xterm */
          overflow-y: hidden !important;
        }
      `}</style>

      <div
        className="workspace-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%',
          background: 'var(--bg-primary)',
          overflow: 'hidden',
        }}
      >
        {/* Top Bar */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '48px',
            padding: '0 16px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/dashboard"
              style={{
                fontWeight: 'bold',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Code2 size={18} /> CL
            </Link>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
              <div style={{ position: 'relative' }}>
                <span
                  onClick={(e) => handleMenuClick(e, 'file')}
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    color: activeMenu === 'file' ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseOut={(e) => {
                    if (activeMenu !== 'file')
                      e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  File
                </span>
                {activeMenu === 'file' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      minWidth: '150px',
                      zIndex: 10,
                    }}
                  >
                    <div
                      onClick={() => handleNewFile()}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      New File
                    </div>
                    <div
                      onClick={() => handleSave()}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Save
                    </div>
                    <a
                      href={`/api/workspace/export?id=${encodeURIComponent(workspaceId)}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        padding: '8px 16px',
                        cursor: 'pointer',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Download Workspace (ZIP)
                    </a>
                    <div
                      onClick={() => handleDeleteFile()}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        color: 'var(--accent-orange)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--accent-orange)';
                      }}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Delete File
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  onClick={(e) => handleMenuClick(e, 'edit')}
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    color: activeMenu === 'edit' ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseOut={(e) => {
                    if (activeMenu !== 'edit')
                      e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Edit
                </span>
                {activeMenu === 'edit' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      minWidth: '150px',
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Undo
                    </div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Redo
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  onClick={(e) => handleMenuClick(e, 'view')}
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    color: activeMenu === 'view' ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseOut={(e) => {
                    if (activeMenu !== 'view')
                      e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  View
                </span>
                {activeMenu === 'view' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      minWidth: '150px',
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onClick={() => setShowCommandPalette(true)}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Command Palette
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  onClick={(e) => handleMenuClick(e, 'git')}
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    color: activeMenu === 'git' ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseOut={(e) => {
                    if (activeMenu !== 'git') e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Source Control
                </span>
                {activeMenu === 'git' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      minWidth: '150px',
                      zIndex: 10,
                    }}
                  >
                    <div
                      onClick={handleGitPush}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Commit & Push
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            {workspaceId}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Collaborators UI */}
            {collaborators.map((c, i) => (
              <div
                key={i}
                title={c.user.name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: c.user.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 0 2px var(--bg-secondary)',
                }}
              >
                {c.user.name.charAt(0).toUpperCase()}
              </div>
            ))}

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Workspace URL copied to clipboard! Share it with collaborators.');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-color)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
            >
              <Share size={14} /> Share
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: showPreview ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-color)')}
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = showPreview
                  ? 'var(--bg-secondary)'
                  : 'var(--bg-tertiary)')
              }
            >
              <Globe size={14} /> Preview
            </button>
            <button
              onClick={handleRunCommand}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--accent-green)',
                color: '#000',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Play size={14} fill="currentColor" /> Run
            </button>
          </div>
        </nav>

        {/* Main Layout using Resizable Panels */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Activity Bar (Far Left) */}
          <div
            style={{
              width: '48px',
              height: '100%',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '12px',
              gap: '16px',
            }}
          >
            <Files
              size={24}
              style={{
                cursor: 'pointer',
                color:
                  activeSidebar === 'explorer' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveSidebar('explorer')}
            />
            <GitBranch
              size={24}
              style={{
                cursor: 'pointer',
                color: activeSidebar === 'git' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveSidebar('git')}
            />
            <Rocket
              size={24}
              style={{
                cursor: 'pointer',
                color: activeSidebar === 'deploy' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveSidebar('deploy')}
            />
          </div>

          <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
            {/* Sidebar (Explorer / Git / Deploy) */}
            <Panel
              defaultSize={20}
              minSize={15}
              style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}
            >
              {activeSidebar === 'explorer' && (
                <>
                  <div
                    style={{
                      padding: '12px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      EXPLORER
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span title="New File" style={{ display: 'flex' }}>
                        <FilePlus
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNewFile(resolveTargetFolder())}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="New Folder" style={{ display: 'flex' }}>
                        <FolderPlus
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNewFolder(resolveTargetFolder())}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="Upload File" style={{ display: 'flex' }}>
                        <Upload
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleUploadTrigger(resolveTargetFolder())}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="Refresh" style={{ display: 'flex' }}>
                        <RefreshCw
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={fetchWorkspace}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="Collapse Folders" style={{ display: 'flex' }}>
                        <ChevronsDown
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedFolders({})}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setSelectedNodePath(null);
                    }}
                    onContextMenu={(e) => handleContextMenu(e)}
                  >
                    {workspaceError ? (
                      <div
                        style={{
                          padding: '16px',
                          color: '#f87171',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                        }}
                      >
                        Error: {workspaceError}
                      </div>
                    ) : Object.keys(fileTree).length > 0 ? (
                      Object.values(fileTree).map((node: any, idx) => (
                        <FileTreeNode
                          key={node.path || idx}
                          node={node}
                          level={0}
                          expandedFolders={expandedFolders}
                          setExpandedFolders={setExpandedFolders}
                          activeFile={activeFile}
                          openFile={openFile}
                          onContextMenu={handleContextMenu}
                          selectedNodePath={selectedNodePath}
                          setSelectedNodePath={setSelectedNodePath}
                        />
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '16px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                        }}
                      >
                        Loading workspace...
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSidebar === 'git' && (
                <>
                  <div
                    style={{
                      padding: '12px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      SOURCE CONTROL
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <GitPanel workspaceId={workspaceId} />
                  </div>
                </>
              )}

              {activeSidebar === 'deploy' && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <DeploymentPanel workspaceId={workspaceId} />
                </div>
              )}
            </Panel>

            <PanelResizeHandle
              className="resize-handle"
              style={{ width: '1px', cursor: 'col-resize' }}
            />

            {/* Center Area (Editor + Terminal) */}
            <Panel
              defaultSize={65}
              minSize={30}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <PanelGroup orientation="vertical">
                {/* Editor (and Preview) Area */}
                <Panel
                  defaultSize={70}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <PanelGroup orientation="horizontal">
                    <Panel
                      defaultSize={showPreview ? 50 : 100}
                      style={{ display: 'flex', flexDirection: 'column' }}
                    >
                      {/* Editor Tabs */}
                      <div
                        style={{
                          display: 'flex',
                          background: 'var(--bg-secondary)',
                          borderBottom: '1px solid var(--border-color)',
                          overflowX: 'auto',
                        }}
                      >
                        {Object.keys(files).map((filename) => (
                          <div
                            key={filename}
                            onClick={() => setActiveFile(filename)}
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderRight: '1px solid var(--border-color)',
                              background:
                                activeFile === filename ? 'var(--bg-primary)' : 'transparent',
                              color:
                                activeFile === filename
                                  ? 'var(--text-primary)'
                                  : 'var(--text-secondary)',
                              borderTop:
                                activeFile === filename
                                  ? '2px solid var(--accent-green)'
                                  : '2px solid transparent',
                              transition: 'background 0.2s',
                            }}
                            onMouseOver={(e) => {
                              if (activeFile !== filename)
                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                            }}
                            onMouseOut={(e) => {
                              if (activeFile !== filename)
                                e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {getFileIcon(filename)}
                            {filename}
                          </div>
                        ))}
                      </div>

                      {/* Monaco Editor */}
                      <div style={{ flex: 1, position: 'relative' }}>
                        {activeFile && files[activeFile] ? (
                          <Editor
                            path={activeFile}
                            height="100%"
                            language={files[activeFile].language}
                            theme="vs-dark"
                            defaultValue={files[activeFile].content}
                            onMount={handleEditorDidMount}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              fontFamily: 'var(--font-mono)',
                              padding: { top: 16 },
                              scrollBeyondLastLine: false,
                              smoothScrolling: true,
                              cursorBlinking: 'smooth',
                              cursorSmoothCaretAnimation: 'on',
                              formatOnPaste: true,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              height: '100%',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            Loading workspace...
                          </div>
                        )}
                      </div>
                    </Panel>

                    {showPreview && (
                      <>
                        <PanelResizeHandle
                          className="resize-handle"
                          style={{ width: '1px', cursor: 'col-resize' }}
                        />
                        <Panel defaultSize={50} minSize={20}>
                          <PreviewPanel
                            workspaceId={workspaceId}
                            onClose={() => setShowPreview(false)}
                          />
                        </Panel>
                      </>
                    )}
                  </PanelGroup>
                </Panel>

                <PanelResizeHandle
                  className="resize-handle"
                  style={{ height: '1px', cursor: 'row-resize' }}
                />

                {/* Terminal Panel */}
                <Panel
                  defaultSize={30}
                  minSize={10}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-secondary)',
                  }}
                  onResize={() => {
                    if (xtermInstances.current[activeTerminalId])
                      xtermInstances.current[activeTerminalId].fitAddon.fit();
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      padding: '8px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      gap: '16px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span
                        onClick={() => setActiveBottomTab('terminal')}
                        style={{
                          color:
                            activeBottomTab === 'terminal'
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                          borderBottom:
                            activeBottomTab === 'terminal'
                              ? '1px solid var(--accent-green)'
                              : '1px solid transparent',
                          cursor: 'pointer',
                          paddingBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <TerminalIcon size={12} /> TERMINAL
                      </span>
                      <span
                        onClick={() => setActiveBottomTab('output')}
                        style={{
                          color:
                            activeBottomTab === 'output'
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                          borderBottom:
                            activeBottomTab === 'output'
                              ? '1px solid var(--accent-green)'
                              : '1px solid transparent',
                          cursor: 'pointer',
                          paddingBottom: '4px',
                          transition: 'color 0.2s',
                        }}
                      >
                        OUTPUT
                      </span>
                      <span
                        onClick={() => setActiveBottomTab('problems')}
                        style={{
                          color:
                            activeBottomTab === 'problems'
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                          borderBottom:
                            activeBottomTab === 'problems'
                              ? '1px solid var(--accent-green)'
                              : '1px solid transparent',
                          cursor: 'pointer',
                          paddingBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'color 0.2s',
                        }}
                      >
                        <AlertCircle size={12} /> PROBLEMS
                      </span>
                    </div>
                    {activeBottomTab === 'terminal' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: '2px',
                          }}
                          onClick={() => handleNewTerminal('powershell')}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        >
                          <Plus size={14} />
                          <ChevronDownIcon size={12} />
                        </div>
                        <SplitSquareHorizontal
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                        <Trash
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleKillTerminal(activeTerminalId)}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      background: 'var(--bg-secondary)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Main Content Area */}
                    <div
                      style={{
                        flex: 1,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                      }}
                    >
                      {activeBottomTab === 'terminal' && terminals.length === 0 && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          No active terminals. Click + to spawn one.
                        </div>
                      )}
                      {terminals.map((term) => (
                        <div
                          key={term.id}
                          ref={terminalRef(term.id)}
                          style={{
                            width: '100%',
                            height: '100%',
                            display:
                              activeBottomTab === 'terminal' && activeTerminalId === term.id
                                ? 'block'
                                : 'none',
                          }}
                        />
                      ))}

                      {activeBottomTab === 'output' && (
                        <div
                          style={{
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                          }}
                        >
                          [Info] Code Analyzer starting up...
                          <br />
                          [Info] Workspace parsed successfully.
                          <br />
                          [Info] 0 errors, 0 warnings.
                        </div>
                      )}

                      {activeBottomTab === 'problems' && (
                        <div
                          style={{
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                          }}
                        >
                          No problems have been detected in the workspace.
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar for Terminals */}
                    {activeBottomTab === 'terminal' && terminals.length > 0 && (
                      <div
                        style={{
                          width: '180px',
                          borderLeft: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '8px',
                        }}
                      >
                        {terminals.map((term) => (
                          <div
                            key={term.id}
                            onClick={() => setActiveTerminalId(term.id)}
                            style={{
                              padding: '6px 8px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.8rem',
                              color:
                                activeTerminalId === term.id
                                  ? 'var(--text-primary)'
                                  : 'var(--text-secondary)',
                              background:
                                activeTerminalId === term.id ? 'var(--bg-tertiary)' : 'transparent',
                            }}
                            onMouseOver={(e) => {
                              if (activeTerminalId !== term.id)
                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                            }}
                            onMouseOut={(e) => {
                              if (activeTerminalId !== term.id)
                                e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <TerminalIcon size={12} />
                            {term.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle
              className="resize-handle"
              style={{ width: '1px', cursor: 'col-resize' }}
            />

            {/* Right Panel (AI/Chat) */}
            <Panel
              defaultSize={20}
              minSize={15}
              style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}
            >
              <AiChatPanel
                activeFile={activeFile}
                fileContent={activeFile && files[activeFile] ? files[activeFile].content : ''}
                workspaceId={workspaceId}
              />
            </Panel>
          </PanelGroup>
        </div>

        {/* Status Bar */}

        <footer
          style={{
            height: '24px',
            background: 'var(--accent-orange)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                cursor: 'pointer',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              <GitBranch size={12} /> main
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> 0 ↓ 0 ↑
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> 0
            </span>
            <span
              style={{
                cursor: 'pointer',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              💾 {(storageUsage.usedBytes / 1024 / 1024).toFixed(1)} MB /{' '}
              {(storageUsage.quotaBytes / 1024 / 1024).toFixed(0)} MB
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              Ln 1, Col 1
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              UTF-8
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              {activeFile && files[activeFile]
                ? files[activeFile].language === 'typescript'
                  ? 'TypeScript'
                  : files[activeFile].language || 'JSON'
                : ''}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              <Settings size={12} /> Prettier
            </span>
            {isSaving && <span style={{ color: 'var(--bg-primary)' }}>Saving...</span>}
          </div>
        </footer>

        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 100,
              padding: '4px 0',
              minWidth: '160px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="context-menu-item"
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={() => {
                setContextMenu(null);
                handleNewFile(
                  contextMenu.type === 'directory'
                    ? contextMenu.path
                    : contextMenu.path.substring(0, contextMenu.path.lastIndexOf('/')),
                );
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-purple)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <FilePlus size={14} /> New File
            </div>
            <div
              className="context-menu-item"
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={() => {
                setContextMenu(null);
                handleNewFolder(
                  contextMenu.type === 'directory'
                    ? contextMenu.path
                    : contextMenu.path.substring(0, contextMenu.path.lastIndexOf('/')),
                );
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-purple)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <FolderPlus size={14} /> New Folder
            </div>
            {!contextMenu.isRoot && (
              <>
                <div
                  style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}
                />
                <div
                  className="context-menu-item"
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onClick={() => {
                    setContextMenu(null);
                    handleRenameFile(contextMenu.path);
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-purple)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileType2 size={14} /> Rename
                </div>
                <div
                  className="context-menu-item"
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ff5f56',
                  }}
                  onClick={() => {
                    setContextMenu(null);
                    handleDeleteFile(contextMenu.path);
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#ff5f5633')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash size={14} /> Delete
                </div>
              </>
            )}
            <div
              className="context-menu-item"
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={() =>
                handleUploadTrigger(
                  contextMenu.type === 'directory'
                    ? contextMenu.path
                    : contextMenu.path.substring(0, contextMenu.path.lastIndexOf('/')),
                )
              }
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-purple)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Upload size={14} /> Upload File
            </div>
            {contextMenu.type === 'file' && (
              <div
                className="context-menu-item"
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => handleDownloadFile(contextMenu.path)}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-purple)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Download size={14} /> Download File
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUploadFileSelect}
        />

        {showCommandPalette && (
          <div
            onClick={() => setShowCommandPalette(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '96px',
              zIndex: 50,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '600px',
                height: '300px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <input
                type="text"
                placeholder="> Type a command..."
                autoFocus
                style={{
                  padding: '16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '1rem',
                  width: '100%',
                }}
              />
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  recently used
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>Format Document</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Shift+Alt+F
                  </span>
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '4px',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>Terminal: Create New Terminal</span>
                  <span style={{ fontSize: '0.75rem' }}>Ctrl+Shift+`</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
