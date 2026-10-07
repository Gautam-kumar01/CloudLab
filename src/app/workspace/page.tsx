'use client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { getErrorMessage } from '@/lib/error-utils';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>Loading Editor...</div>
});
const DiffEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.DiffEditor), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>Loading Diff Editor...</div>
});
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
  Search as SearchIcon,
  AlertTriangle,
  XCircle,
  Info,
  Edit2,
  Package,
} from 'lucide-react';

import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';
// xterm and fit-addon are dynamically imported inside terminalRef to reduce initial bundle size
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import GitPanel from './GitPanel';
import AiChatPanel from './AiChatPanel';
import PreviewPanel from './PreviewPanel';
import DeploymentPanel from './DeploymentPanel';
import SearchPanel from './SearchPanel';
import NpmScriptsPanel from './NpmScriptsPanel';
import FileIcon from './FileIcon';

const COMMAND_ITEMS = [
  { id: 'open-folder', label: 'File: Open Desktop Folder...', icon: '📁' },
  { id: 'export-zip', label: 'File: Export Workspace as ZIP', icon: '📦' },
  { id: 'create-snapshot', label: 'Backup: Create Point-in-Time Snapshot', icon: '💾' },
  { id: 'view-snapshots', label: 'Backup: Manage & Restore Workspace Snapshots', icon: '🕒' },
  { id: 'manage-members', label: 'Collaboration: Manage Members & Roles', icon: '👥' },
  { id: 'save-file', label: 'File: Save Current File', icon: '💾' },
  { id: 'new-file', label: 'File: New File', icon: '📄' },
  { id: 'new-folder', label: 'File: New Folder', icon: '📂' },
  { id: 'search-workspace', label: 'View: Find in Files (Global Search)', icon: '🔍' },
  { id: 'toggle-split', label: 'View: Toggle Side-by-Side Split Editor (Ctrl+\\)', icon: '◫' },
  { id: 'split-terminal', label: 'Terminal: Toggle Split Terminal (Side-by-Side)', icon: '◫' },
  { id: 'toggle-wrap', label: 'View: Toggle Word Wrap (Alt+Z)', icon: '↩' },
  { id: 'toggle-minimap', label: 'View: Toggle Editor Minimap', icon: '🗺️' },
  { id: 'toggle-problems', label: 'View: Show Problems & Diagnostics', icon: '⚠️' },
  { id: 'run-active-file', label: 'Run: Execute Active File', icon: '▶️' },
  { id: 'publish-github', label: 'Source Control: Publish to GitHub', icon: '🐙' },
  { id: 'deploy-docker', label: 'Docker: Build & Deploy to Container', icon: '🐳' },
  { id: 'toggle-preview', label: 'View: Toggle Live Web Preview', icon: '🌐' },
  { id: 'refresh-files', label: 'Explorer: Refresh Workspace Files', icon: '🔄' },
];
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
          <FileIcon filename={node.name} isDirectory={true} isOpen={isExpanded} size={15} />
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
      <FileIcon filename={node.name} isDirectory={false} size={15} />
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
  const [paletteMode, setPaletteMode] = useState<'commands' | 'files'>('commands');
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'search' | 'git' | 'deploy'>('explorer');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const monacoRef = useRef<any>(null);
  const [markers, setMarkers] = useState<Array<{
    owner: string;
    resource: string;
    severity: number;
    message: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    code?: string;
  }>>([]);
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

  // Phase 2: Diff Editor, Split Editor & Quick Settings State
  const [diffState, setDiffState] = useState<{
    filePath: string;
    original: string;
    modified: string;
    language: string;
  } | null>(null);
  const diffStateRef = useRef(diffState);
  useEffect(() => {
    diffStateRef.current = diffState;
  }, [diffState]);

  const [isSplitEditor, setIsSplitEditor] = useState(false);
  const [activeFilePane2, setActiveFilePane2] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<1 | 2>(1);
  const [editorMinimap, setEditorMinimap] = useState(false);
  const [editorWordWrap, setEditorWordWrap] = useState<'on' | 'off'>('on');
  const [editorFontSize, setEditorFontSize] = useState(13.5);
  const [editorTabSize, setEditorTabSize] = useState(2);

  const handleOpenFileDiff = async (filePath: string) => {
    try {
      if (isSplitEditor) setIsSplitEditor(false);
      const res = await fetch(`/api/git/diff?id=${encodeURIComponent(workspaceId)}&file=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        alert('Failed to load git diff: ' + (data.error?.message || data.error || 'Unknown error'));
        return;
      }
      const originalContent = data.data?.original ?? '';
      const modifiedContent = files[filePath]?.content ?? data.data?.modified ?? '';
      const lang = getLanguage(filePath);

      setDiffState({
        filePath,
        original: originalContent,
        modified: modifiedContent,
        language: lang,
      });
    } catch (e: any) {
      alert('Error loading git diff: ' + e.message);
    }
  };

  const handleToggleSplitEditor = () => {
    if (!isSplitEditor) {
      if (diffState) setDiffState(null);
      const otherFiles = Object.keys(files).filter((f) => f !== activeFile);
      setActiveFilePane2(otherFiles.length > 0 ? otherFiles[0] : activeFile);
      setIsSplitEditor(true);
      setActivePane(2);
    } else {
      setIsSplitEditor(false);
      setActivePane(1);
    }
  };

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

  // Phase 3: Collaboration & RBAC States
  const [workspaceRole, setWorkspaceRole] = useState<'OWNER' | 'EDITOR' | 'VIEWER' | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<{ owner?: any; members: any[] }>({ members: [] });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [isInviting, setIsInviting] = useState(false);

  // Phase 3: Workspace Snapshot / Backup States
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/workspace/members?workspaceId=${encodeURIComponent(workspaceId)}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setWorkspaceMembers(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch members:', e);
    }
  };

  const handleOpenShareModal = () => {
    setShowShareModal(true);
    fetchMembers();
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/workspace/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setInviteEmail('');
        fetchMembers();
        alert('Collaborator added successfully!');
      } else {
        alert(data.error?.message || data.error || 'Failed to add collaborator');
      }
    } catch (e: any) {
      alert(`Error inviting collaborator: ${e.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      const res = await fetch(
        `/api/workspace/members?workspaceId=${encodeURIComponent(workspaceId)}&memberId=${encodeURIComponent(memberId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchMembers();
      } else {
        alert('Failed to remove collaborator');
      }
    } catch (e: any) {
      alert(`Error removing collaborator: ${e.message}`);
    }
  };

  const fetchSnapshots = async () => {
    setSnapshotLoading(true);
    try {
      const res = await fetch(`/api/workspace/backup?workspaceId=${encodeURIComponent(workspaceId)}`);
      const data = await res.json();
      if (res.ok) {
        setSnapshots(data.data || data || []);
      }
    } catch (e) {
      console.error('Failed to fetch snapshots:', e);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleOpenSnapshotModal = () => {
    setShowSnapshotModal(true);
    fetchSnapshots();
  };

  const handleCreateSnapshot = async (desc?: string) => {
    const description = desc !== undefined ? desc : prompt('Enter snapshot description (optional):', 'Point-in-time snapshot');
    if (description === null) return;
    setIsCreatingSnapshot(true);
    try {
      const res = await fetch('/api/workspace/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, description: description || 'Manual Snapshot' }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        alert('Snapshot created successfully!');
        if (showSnapshotModal) fetchSnapshots();
      } else {
        alert(data.error?.message || data.error || 'Failed to create snapshot');
      }
    } catch (e: any) {
      alert(`Error creating snapshot: ${e.message}`);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!confirm('Are you sure you want to restore to this snapshot? Current unsaved workspace changes will be overwritten.')) return;
    try {
      const res = await fetch('/api/workspace/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, snapshotId }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        alert('Workspace restored successfully! Reloading files...');
        fetchWorkspace();
        setShowSnapshotModal(false);
      } else {
        alert(data.error?.message || data.error || 'Failed to restore snapshot');
      }
    } catch (e: any) {
      alert(`Error restoring snapshot: ${e.message}`);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm('Are you sure you want to delete this snapshot?')) return;
    try {
      const res = await fetch(
        `/api/workspace/backup?workspaceId=${encodeURIComponent(workspaceId)}&snapshotId=${encodeURIComponent(snapshotId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchSnapshots();
      } else {
        alert('Failed to delete snapshot');
      }
    } catch (e: any) {
      alert(`Error deleting snapshot: ${e.message}`);
    }
  };

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

  const [projectInfo, setProjectInfo] = useState<{
    name: string;
    githubRepo?: string;
    branch?: string;
  } | null>(null);

  type TerminalState = { id: string; title: string; shellType: string };
  const [terminals, setTerminals] = useState<TerminalState[]>([
    { id: 'term-1', title: 'bash', shellType: 'default' },
  ]);
  const terminalsRef = useRef<TerminalState[]>(terminals);
  useEffect(() => {
    terminalsRef.current = terminals;
  }, [terminals]);
  const [activeTerminalId, setActiveTerminalId] = useState('term-1');
  const [isTerminalSplit, setIsTerminalSplit] = useState(false);
  const [splitTerminalId, setSplitTerminalId] = useState<string | null>(null);
  const [editingTerminalId, setEditingTerminalId] = useState<string | null>(null);
  const [editingTerminalTitle, setEditingTerminalTitle] = useState('');

  const workspaceIdRef = useRef(workspaceId);
  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  const spawnedTerminals = useRef<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const xtermInstances = useRef<
    Record<string, { term: any; fitAddon: any; container: HTMLDivElement }>
  >({});
  const pendingTerminalData = useRef<Record<string, string[]>>({});
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLanguage = (fname: string) => {
    if (fname.endsWith('.ts') || fname.endsWith('.tsx')) return 'typescript';
    if (fname.endsWith('.js') || fname.endsWith('.jsx')) return 'javascript';
    if (fname.endsWith('.json')) return 'json';
    if (fname.endsWith('.css')) return 'css';
    if (fname.endsWith('.html')) return 'html';
    if (fname.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  useEffect(() => {
    fetch(`/api/workspace/access?id=${encodeURIComponent(workspaceId)}`)
      .then((r) => r.json())
      .then((res) => {
        const data = res.data || res;
        if (data && data.role) {
          setWorkspaceRole(data.role);
        }
        if (data && data.projectName) {
          setProjectInfo({
            name: data.projectName,
            githubRepo: data.githubRepo,
            branch: data.branch || 'main',
          });
          if (typeof document !== 'undefined') {
            document.title = `${data.projectName} — CloudLab Workspace`;
          }
        }
      })
      .catch(() => {});
  }, [workspaceId]);

  const openFile = async (filePath: string, node?: any) => {
    if (diffState) setDiffState(null);
    const filename = node?.name || filePath.split('/').pop() || filePath;
    const lang = node?.language || getLanguage(filePath);

    if (files[filePath] && files[filePath].content !== '// Loading...' && files[filePath].content !== '// Failed to load file') {
      if (isSplitEditor && activePane === 2) {
        setActiveFilePane2(filePath);
      } else {
        setActiveFile(filePath);
      }
      return;
    }

    // Immediately open tab with loading state
    setFiles((prev) => ({
      ...prev,
      [filePath]: {
        name: filename,
        language: lang,
        content: prev[filePath]?.content && prev[filePath].content !== '// Loading...' ? prev[filePath].content : '// Loading...',
      },
    }));
    if (isSplitEditor && activePane === 2) {
      setActiveFilePane2(filePath);
    } else {
      setActiveFile(filePath);
    }

    try {
      const res = await fetch(
        `/api/workspace/file?id=${encodeURIComponent(workspaceId)}&filename=${encodeURIComponent(filePath)}`,
      );
      const data = await res.json();
      if (data.content !== undefined) {
        setFiles((prev) => ({
          ...prev,
          [filePath]: { name: filename, language: lang, content: data.content },
        }));
      } else {
        setFiles((prev) => ({
          ...prev,
          [filePath]: { name: filename, language: lang, content: data.error ? `// ${getErrorMessage(data, 'Failed to load file')}` : '' },
        }));
      }
    } catch (e) {
      console.error('Failed to load file:', e);
      setFiles((prev) => ({
        ...prev,
        [filePath]: { name: filename, language: lang, content: '// Failed to load file' },
      }));
    }
  };

  const handleCloseTab = (filePath: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[filePath];
      return newFiles;
    });
    if (activeFile === filePath) {
      const remaining = Object.keys(files).filter((f) => f !== filePath);
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1] : '');
    }
    if (activeFilePane2 === filePath) {
      const remaining = Object.keys(files).filter((f) => f !== filePath);
      setActiveFilePane2(remaining.length > 0 ? remaining[remaining.length - 1] : null);
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


  const handleSave = async (specificFile?: string, specificContent?: string) => {
    if (workspaceRole === 'VIEWER') {
      alert('You have read-only VIEWER access to this workspace.');
      return;
    }
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

  const handleExportZip = () => {
    const link = document.createElement('a');
    link.href = `/api/workspace/export?workspaceId=${encodeURIComponent(workspaceId)}`;
    link.download = `${workspaceId}-export.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveMenu(null);
  };

  const handleOpenDesktopFolder = async () => {
    setActiveMenu(null);
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the Directory Picker API. Please use Chrome or Edge to open desktop folders.');
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      if (!dirHandle) return;

      const name = dirHandle.name;
      const uploadedFiles: { path: string; content: string; isBinary?: boolean }[] = [];

      async function scanDirectory(handle: any, currentPath = '') {
        for await (const entry of handle.values()) {
          const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
          if (['.git', 'node_modules', '.next', 'dist', '.turbo', '__pycache__'].includes(entry.name)) continue;

          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (file.size < 5 * 1024 * 1024) {
              const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
              const isBinary = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip'].includes(ext);
              if (isBinary) {
                const arrayBuffer = await file.arrayBuffer();
                const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                uploadedFiles.push({ path: entryPath, content: base64, isBinary: true });
              } else {
                const text = await file.text();
                uploadedFiles.push({ path: entryPath, content: text });
              }
            }
          } else if (entry.kind === 'directory') {
            await scanDirectory(entry, entryPath);
          }
        }
      }

      await scanDirectory(dirHandle);

      if (uploadedFiles.length === 0) {
        alert('Selected folder is empty or has no readable files.');
        return;
      }

      const res = await fetch('/api/workspace/upload-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: name, files: uploadedFiles }),
      });

      const data = await res.json();
      if (res.ok && data.project?.id) {
        router.push(`/workspace?id=${encodeURIComponent(data.project.id)}`);
      } else {
        alert(getErrorMessage(data, 'Failed to import folder'));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('Error opening folder: ' + err.message);
      }
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

  const executePaletteCommand = (id: string) => {
    setShowCommandPalette(false);
    switch (id) {
      case 'open-folder':
        handleOpenDesktopFolder();
        break;
      case 'export-zip':
        handleExportZip();
        break;
      case 'create-snapshot':
        handleCreateSnapshot();
        break;
      case 'view-snapshots':
        handleOpenSnapshotModal();
        break;
      case 'manage-members':
        handleOpenShareModal();
        break;
      case 'save-file':
        handleSave();
        break;
      case 'new-file':
        handleNewFile();
        break;
      case 'new-folder':
        handleNewFolder();
        break;
      case 'search-workspace':
        setActiveSidebar('search');
        break;
      case 'toggle-problems':
        setActiveBottomTab('problems');
        break;
      case 'toggle-split':
        handleToggleSplitEditor();
        break;
      case 'split-terminal':
        handleToggleSplitTerminal();
        break;
      case 'toggle-wrap':
        setEditorWordWrap((prev) => (prev === 'on' ? 'off' : 'on'));
        break;
      case 'toggle-minimap':
        setEditorMinimap((prev) => !prev);
        break;
      case 'run-active-file':
        handleRunCommand();
        break;
      case 'publish-github':
        setActiveSidebar('git');
        break;
      case 'deploy-docker':
        setActiveSidebar('deploy');
        break;
      case 'toggle-preview':
        setShowPreview((prev) => !prev);
        break;
      case 'refresh-files':
        fetchWorkspace();
        break;
    }
  };

  // Global Keyboard Shortcuts (VS Code shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick Open Files: Ctrl+P or Cmd+P (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && !e.shiftKey) {
        e.preventDefault();
        setPaletteMode('files');
        setCommandQuery('');
        setSelectedPaletteIndex(0);
        setShowCommandPalette(true);
      }
      // Command Palette: Ctrl+Shift+P or Cmd+Shift+P or F1
      else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && e.shiftKey) || e.key === 'F1') {
        e.preventDefault();
        setPaletteMode('commands');
        setCommandQuery('');
        setSelectedPaletteIndex(0);
        setShowCommandPalette(true);
      }
      // Global Search: Ctrl+Shift+F or Cmd+Shift+F
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setActiveSidebar('search');
      }
      // Explorer: Ctrl+Shift+E or Cmd+Shift+E
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setActiveSidebar('explorer');
      }
      // Source Control (Git): Ctrl+Shift+G or Cmd+Shift+G
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setActiveSidebar('git');
      }
      // Toggle Terminal Panel: Ctrl+` or Cmd+`
      else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setActiveBottomTab((prev) => (prev === 'terminal' ? '' : 'terminal'));
      }
      // Toggle Split Editor: Ctrl+\ or Cmd+\
      else if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        handleToggleSplitEditor();
      }
      // Toggle Word Wrap: Alt+Z
      else if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setEditorWordWrap((prev) => (prev === 'on' ? 'off' : 'on'));
      }
      // Run Active File: F5
      else if (e.key === 'F5') {
        e.preventDefault();
        handleRunCommand();
      }
      // Save: Ctrl+S or Cmd+S
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      // Close on Escape
      else if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setActiveMenu(null);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceId, activeFile, files]);

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
          alert('Upload failed: ' + getErrorMessage(data, 'Upload error'));
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
        alert('Git push failed: ' + getErrorMessage(data, 'Git push error'));
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

    socket.on('connect', () => {
      console.log('[Socket] Connected. Syncing terminals...');
      (terminalsRef.current || []).forEach((term) => {
        if (!spawnedTerminals.current.has(term.id)) {
          spawnedTerminals.current.add(term.id);
          const inst = xtermInstances.current[term.id];
          socket.emit('terminal.spawn', {
            id: term.id,
            shellType: term.shellType || 'default',
            workspaceId: workspaceIdRef.current,
            cols: inst?.term?.cols || 80,
            rows: inst?.term?.rows || 30,
          });
        }
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket Connect Error]', err);
    });

    socket.on('terminal.incData', ({ id, data }) => {
      if (xtermInstances.current[id]?.term) {
        xtermInstances.current[id].term.write(data);
      } else {
        if (!pendingTerminalData.current[id]) {
          pendingTerminalData.current[id] = [];
        }
        pendingTerminalData.current[id].push(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle window resizing and tab switching for terminal
  useEffect(() => {
    const handleResize = () => {
      if (activeBottomTab === 'terminal' && xtermInstances.current[activeTerminalId]) {
        try {
          const inst = xtermInstances.current[activeTerminalId];
          inst.fitAddon.fit();
          socketRef.current?.emit('terminal.resize', {
            id: activeTerminalId,
            cols: inst.term.cols,
            rows: inst.term.rows,
          });
        } catch (e) {}
      }
    };
    window.addEventListener('resize', handleResize);
    const timeout = setTimeout(handleResize, 100);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeBottomTab, activeTerminalId]);

  // Terminal DOM attachment via callback ref
  const terminalRef = (id: string) => (node: HTMLDivElement | null) => {
    if (node && !xtermInstances.current[id]) {
      (async () => {
        const { Terminal: XTerm } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');
        
        const term = new XTerm({
          theme: {
            background: '#090d16',
            foreground: '#f1f5f9',
            cursor: '#10b981',
            cursorAccent: '#090d16',
            selectionBackground: 'rgba(16, 185, 129, 0.3)',
            black: '#1e293b',
            red: '#f43f5e',
            green: '#10b981',
            yellow: '#f59e0b',
            blue: '#3b82f6',
            magenta: '#a855f7',
            cyan: '#06b6d4',
            white: '#f8fafc',
            brightBlack: '#64748b',
            brightRed: '#fb7185',
            brightGreen: '#34d399',
            brightYellow: '#fbbf24',
            brightBlue: '#60a5fa',
            brightMagenta: '#c084fc',
            brightCyan: '#22d3ee',
            brightWhite: '#ffffff',
          },
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 13,
          lineHeight: 1.25,
          cursorBlink: true,
          cursorStyle: 'block',
          allowTransparency: true,
          scrollback: 5000,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(node);

        xtermInstances.current[id] = { term, fitAddon, container: node };

        // Flush any pending data received before xterm finished loading
        if (pendingTerminalData.current[id]) {
          pendingTerminalData.current[id].forEach((chunk) => term.write(chunk));
          delete pendingTerminalData.current[id];
        }

        try {
          fitAddon.fit();
          socketRef.current?.emit('terminal.resize', {
            id,
            cols: term.cols,
            rows: term.rows,
          });
        } catch (e) {}

        // Spawn terminal if socket is already connected and not yet spawned
        if (socketRef.current?.connected && !spawnedTerminals.current.has(id)) {
          spawnedTerminals.current.add(id);
          const shellType = terminalsRef.current.find((t) => t.id === id)?.shellType || 'default';
          socketRef.current.emit('terminal.spawn', {
            id,
            shellType,
            workspaceId: workspaceIdRef.current,
            cols: term.cols,
            rows: term.rows,
          });
        }

        term.onData((data) => {
          socketRef.current?.emit('terminal.toTerm', { id, data });
        });

        term.onResize(({ cols, rows }) => {
          socketRef.current?.emit('terminal.resize', { id, cols, rows });
        });

        // Focus terminal for instant typing
        setTimeout(() => {
          try {
            fitAddon.fit();
            term.focus();
          } catch (e) {}
        }, 50);
      })();
    }
  };

  // Re-fit terminal when switching tabs
  useEffect(() => {
    if (activeBottomTab === 'terminal' && xtermInstances.current[activeTerminalId]) {
      setTimeout(() => {
        try {
          const inst = xtermInstances.current[activeTerminalId];
          inst.fitAddon.fit();
          inst.term.focus();
          socketRef.current?.emit('terminal.resize', {
            id: activeTerminalId,
            cols: inst.term.cols,
            rows: inst.term.rows,
          });
        } catch (e) {}
      }, 60);
    }
  }, [activeBottomTab, activeTerminalId]);

  const handleNewTerminal = (shellType: string = 'default') => {
    const id = `term-${Date.now()}`;
    const displayTitle = shellType === 'default' ? 'bash' : shellType;
    setTerminals((prev) => [...prev, { id, title: displayTitle, shellType }]);
    setActiveTerminalId(id);
    setActiveBottomTab('terminal');
  };

  const handleKillTerminal = (id: string) => {
    socketRef.current?.emit('terminal.kill', { id });
    spawnedTerminals.current.delete(id);
    if (splitTerminalId === id) {
      setIsTerminalSplit(false);
      setSplitTerminalId(null);
    }
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

  const handleToggleSplitTerminal = () => {
    if (!isTerminalSplit) {
      const otherTerm = terminals.find((t) => t.id !== activeTerminalId);
      if (otherTerm) {
        setSplitTerminalId(otherTerm.id);
      } else {
        const newId = `term-${Date.now()}`;
        setTerminals((prev) => [...prev, { id: newId, title: 'bash (split)', shellType: 'default' }]);
        setSplitTerminalId(newId);
      }
      setIsTerminalSplit(true);
      setActiveBottomTab('terminal');
    } else {
      setIsTerminalSplit(false);
      setSplitTerminalId(null);
    }
    setTimeout(() => {
      try {
        if (xtermInstances.current[activeTerminalId]) {
          xtermInstances.current[activeTerminalId].fitAddon.fit();
        }
      } catch (e) {}
    }, 120);
  };

  const handleRenameTerminal = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setTerminals((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t))
    );
    setEditingTerminalId(null);
  };

  const handleRunNpmScript = (scriptName: string, command: string) => {
    setActiveBottomTab('terminal');
    if (socketRef.current) {
      socketRef.current.emit('terminal.data', {
        id: activeTerminalId,
        data: `${command}\r`,
      });
      setTimeout(() => {
        try {
          xtermInstances.current[activeTerminalId]?.term?.focus();
        } catch (e) {}
      }, 80);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (workspaceRole === 'VIEWER') return;
    if (value !== undefined) {
      setFiles((prev) => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content: value },
      }));

      // In Yjs mode, we don't save to the backend manually using POST /api/workspace/files on every change
      // The server will handle saving directly from the Yjs document state.
    }
  };

  const handleNavigateToFileAndPosition = async (filePath: string, line: number, column: number) => {
    if (activeFile !== filePath) {
      await openFile(filePath);
    }
    setTimeout(() => {
      if (editorRef.current) {
        try {
          editorRef.current.revealLineInCenter(line);
          editorRef.current.setPosition({ lineNumber: line, column: column || 1 });
          editorRef.current.focus();
        } catch (e) {}
      }
    }, 120);
  };

  const handleRunCommand = () => {
    setActiveBottomTab('terminal');
    if (socketRef.current && activeFile) {
      let cmd = '';
      if (activeFile.endsWith('.ts') || activeFile.endsWith('.tsx')) {
        cmd = `npx tsx "${activeFile}"\r`;
      } else if (activeFile.endsWith('.js') || activeFile.endsWith('.mjs')) {
        cmd = `node "${activeFile}"\r`;
      } else if (activeFile.endsWith('.py')) {
        cmd = `python3 "${activeFile}"\r`;
      } else if (activeFile.endsWith('.sh')) {
        cmd = `bash "${activeFile}"\r`;
      } else if (activeFile.endsWith('.html')) {
        setShowPreview(true);
        return;
      } else {
        cmd = `cat "${activeFile}"\r`;
      }

      socketRef.current.emit('terminal.toTerm', {
        id: activeTerminalId,
        data: cmd,
      });
    }
  };

  const getFileIcon = (filename: string) => {
    return <FileIcon filename={filename} isDirectory={false} size={15} />;
  };

  const handleEditorDidMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;
    if (monaco) {
      monacoRef.current = monaco;
    }
    const effectiveMonaco = monaco || monacoRef.current;

    // Track active cursor position
    try {
      editor.onDidChangeCursorPosition((e: any) => {
        if (e && e.position) {
          setCursorPos({ line: e.position.lineNumber, col: e.position.column });
        }
      });
    } catch (e) {}

    // Subscribe to Monaco compiler markers for live Diagnostics / Problems panel
    if (effectiveMonaco?.editor?.onDidChangeMarkers) {
      const updateMarkers = () => {
        try {
          const all = effectiveMonaco.editor.getModelMarkers({});
          const formatted = all.map((m: any) => {
            let resPath = m.resource?.path || '';
            if (resPath.startsWith('/')) resPath = resPath.substring(1);
            return {
              owner: m.owner || 'compiler',
              resource: resPath,
              severity: m.severity, // 8 = Error, 4 = Warning, 2 = Info, 1 = Hint
              message: m.message,
              startLineNumber: m.startLineNumber,
              startColumn: m.startColumn,
              endLineNumber: m.endLineNumber,
              endColumn: m.endColumn,
              code: typeof m.code === 'string' ? m.code : m.code?.value,
            };
          });
          setMarkers(formatted);
        } catch (e) {}
      };

      effectiveMonaco.editor.onDidChangeMarkers(updateMarkers);
      updateMarkers();
    }

    // Ensure model has current file content if available
    if (activeFile && files[activeFile]?.content && files[activeFile].content !== '// Loading...') {
      try {
        const currentVal = editor.getValue();
        if (!currentVal || currentVal === '// Loading...') {
          editor.setValue(files[activeFile].content);
        }
      } catch (e) {}
    }

    // Dynamically import y-monaco only on the client side
    try {
      const { MonacoBinding } = await import('y-monaco');

      // Cleanup previous Yjs state if any
      if (bindingRef.current) {
        try { bindingRef.current.destroy(); } catch (e) {}
        bindingRef.current = null;
      }
      if (providerRef.current) {
        try { providerRef.current.destroy(); } catch (e) {}
        providerRef.current = null;
      }
      if (ydocRef.current) {
        try { ydocRef.current.destroy(); } catch (e) {}
        ydocRef.current = null;
      }

      if (activeFile && typeof window !== 'undefined') {
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
        // Seed Yjs text with file content if empty so Monaco editor is not blanked out
        if (ytext.length === 0 && files[activeFile]?.content && files[activeFile].content !== '// Loading...') {
          ytext.insert(0, files[activeFile].content);
        }

        const binding = new MonacoBinding(
          ytext,
          editor.getModel(),
          new Set([editor]),
          provider.awareness,
        );
        bindingRef.current = binding;
      }
    } catch (err) {
      console.warn('[Collaboration] Monaco binding skipped:', err);
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
                      minWidth: '200px',
                      zIndex: 10,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div
                      onClick={() => handleNewFile()}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      New File
                    </div>
                    <div
                      onClick={handleOpenDesktopFolder}
                      style={{ padding: '8px 16px', cursor: 'pointer', color: 'var(--accent-green)', fontWeight: 600 }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Open Folder (Desktop)...
                    </div>
                    <div
                      onClick={() => handleSave()}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Save (Ctrl+S)
                    </div>
                    <div
                      onClick={handleExportZip}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Export as ZIP
                    </div>
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
                      Undo (Ctrl+Z)
                    </div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-secondary)')
                      }
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Redo (Ctrl+Y)
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
                      minWidth: '220px',
                      zIndex: 10,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onClick={() => {
                        setPaletteMode('commands');
                        setCommandQuery('');
                        setShowCommandPalette(true);
                        setActiveMenu(null);
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Command Palette (Ctrl+Shift+P)
                    </div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onClick={() => {
                        setPaletteMode('files');
                        setCommandQuery('');
                        setShowCommandPalette(true);
                        setActiveMenu(null);
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Quick Open Files (Ctrl+P)
                    </div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onClick={() => {
                        setShowPreview(!showPreview);
                        setActiveMenu(null);
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Toggle Live Preview
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
                      minWidth: '200px',
                      zIndex: 10,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div
                      onClick={() => {
                        setActiveSidebar('git');
                        setActiveMenu(null);
                      }}
                      style={{ padding: '8px 16px', cursor: 'pointer' }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Open Git Panel
                    </div>
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
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              padding: '4px 14px',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
              <Folder size={14} color="#dcb67a" fill="#dcb67a" />
              <span>{projectInfo?.name || workspaceId}</span>
            </div>
            {projectInfo?.branch && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 500,
                }}
              >
                <GitBranch size={11} />
                {projectInfo.branch}
              </span>
            )}

            {workspaceRole && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background:
                    workspaceRole === 'OWNER'
                      ? 'rgba(168, 85, 247, 0.15)'
                      : workspaceRole === 'EDITOR'
                      ? 'rgba(6, 182, 212, 0.15)'
                      : 'rgba(234, 179, 8, 0.15)',
                  color:
                    workspaceRole === 'OWNER'
                      ? '#c084fc'
                      : workspaceRole === 'EDITOR'
                      ? '#22d3ee'
                      : '#eab308',
                  border: '1px solid',
                  borderColor:
                    workspaceRole === 'OWNER'
                      ? 'rgba(168, 85, 247, 0.3)'
                      : workspaceRole === 'EDITOR'
                      ? 'rgba(6, 182, 212, 0.3)'
                      : 'rgba(234, 179, 8, 0.3)',
                  fontWeight: 600,
                }}
              >
                {workspaceRole === 'VIEWER' ? '👁️ VIEWER' : workspaceRole === 'OWNER' ? '👑 OWNER' : '✏️ EDITOR'}
              </span>
            )}
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
              onClick={handleOpenSnapshotModal}
              title="Workspace Snapshots & Point-in-time Backups"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-color)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Package size={14} /> Snapshots
            </button>

            <button
              onClick={handleOpenShareModal}
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
            <div
              title="Explorer (Ctrl+Shift+E)"
              onClick={() => setActiveSidebar('explorer')}
              style={{
                cursor: 'pointer',
                color:
                  activeSidebar === 'explorer' ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Files size={22} />
            </div>
            <div
              title="Search (Ctrl+Shift+F)"
              onClick={() => setActiveSidebar('search')}
              style={{
                cursor: 'pointer',
                color:
                  activeSidebar === 'search' ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon size={22} />
            </div>
            <div
              title="Source Control (Ctrl+Shift+G)"
              onClick={() => setActiveSidebar('git')}
              style={{
                cursor: 'pointer',
                color: activeSidebar === 'git' ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitBranch size={22} />
            </div>
            <div
              title="Deployments & Containers"
              onClick={() => setActiveSidebar('deploy')}
              style={{
                cursor: 'pointer',
                color: activeSidebar === 'deploy' ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Rocket size={22} />
            </div>
          </div>

          <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
            {/* Sidebar (Explorer / Git / Deploy) */}
            <Panel
              defaultSize={26}
              minSize={20}
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
                      <span title="New File" style={{ display: 'flex' }} role="button" aria-label="New File" tabIndex={0}>
                        <FilePlus
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNewFile(resolveTargetFolder())}
                          onKeyDown={(e) => e.key === 'Enter' && handleNewFile(resolveTargetFolder())}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="New Folder" style={{ display: 'flex' }} role="button" aria-label="New Folder" tabIndex={0}>
                        <FolderPlus
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNewFolder(resolveTargetFolder())}
                          onKeyDown={(e) => e.key === 'Enter' && handleNewFolder(resolveTargetFolder())}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="Upload File" style={{ display: 'flex' }} role="button" aria-label="Upload File" tabIndex={0}>
                        <Upload
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleUploadTrigger(resolveTargetFolder())}
                          onKeyDown={(e) => e.key === 'Enter' && handleUploadTrigger(resolveTargetFolder())}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="Refresh" style={{ display: 'flex' }} role="button" aria-label="Refresh Explorer" tabIndex={0}>
                        <RefreshCw
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={fetchWorkspace}
                          onKeyDown={(e) => e.key === 'Enter' && fetchWorkspace()}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        />
                      </span>
                      <span title="Collapse Folders" style={{ display: 'flex' }} role="button" aria-label="Collapse All Folders" tabIndex={0}>
                        <ChevronsDown
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedFolders({})}
                          onKeyDown={(e) => e.key === 'Enter' && setExpandedFolders({})}
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

                  {/* NPM Scripts Explorer */}
                  <NpmScriptsPanel
                    workspaceId={workspaceId}
                    onRunScript={handleRunNpmScript}
                    onOpenFile={openFile}
                  />
                </>
              )}

              {activeSidebar === 'search' && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <SearchPanel
                    workspaceId={workspaceId}
                    onNavigateToFile={handleNavigateToFileAndPosition}
                    onRefreshFiles={fetchWorkspace}
                  />
                </div>
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
                    <GitPanel
                      workspaceId={workspaceId}
                      onOpenFileDiff={handleOpenFileDiff}
                    />
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
              defaultSize={46}
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
                      {/* Editor Tabs & Quick Action Toolbar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-secondary)',
                          borderBottom: '1px solid var(--border-color)',
                          minHeight: '35px',
                        }}
                      >
                        {/* Tabs List */}
                        <div
                          style={{
                            display: 'flex',
                            overflowX: 'auto',
                            flex: 1,
                            scrollbarWidth: 'none',
                          }}
                        >
                          {Object.keys(files).map((filename) => (
                            <div
                              key={filename}
                              onClick={() => {
                                if (diffState) setDiffState(null);
                                if (activePane === 2) {
                                  setActiveFilePane2(filename);
                                } else {
                                  setActiveFile(filename);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRight: '1px solid var(--border-color)',
                                background:
                                  !diffState && (activePane === 2 ? activeFilePane2 === filename : activeFile === filename)
                                    ? 'var(--bg-primary)'
                                    : 'transparent',
                                color:
                                  !diffState && (activePane === 2 ? activeFilePane2 === filename : activeFile === filename)
                                    ? 'var(--text-primary)'
                                    : 'var(--text-secondary)',
                                borderTop:
                                  !diffState && (activePane === 2 ? activeFilePane2 === filename : activeFile === filename)
                                    ? '2px solid var(--accent-green)'
                                    : '2px solid transparent',
                                transition: 'background 0.2s',
                                userSelect: 'none',
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
                              <span>{filename.split('/').pop()}</span>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseTab(filename);
                                }}
                                style={{
                                  marginLeft: '4px',
                                  padding: '0 4px',
                                  borderRadius: '3px',
                                  fontSize: '13px',
                                  opacity: 0.5,
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.5')}
                              >
                                ×
                              </span>
                            </div>
                          ))}

                          {/* Active Diff Tab */}
                          {diffState && (
                            <div
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRight: '1px solid var(--border-color)',
                                background: 'var(--bg-primary)',
                                color: '#06b6d4',
                                borderTop: '2px solid #06b6d4',
                                userSelect: 'none',
                              }}
                            >
                              <FileCode size={13} style={{ color: '#06b6d4' }} />
                              <span>{diffState.filePath.split('/').pop()} (Diff: HEAD ↔ Working)</span>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiffState(null);
                                }}
                                style={{
                                  marginLeft: '6px',
                                  padding: '0 4px',
                                  borderRadius: '3px',
                                  fontSize: '13px',
                                  opacity: 0.7,
                                  color: '#fff',
                                }}
                                title="Close Diff"
                              >
                                ×
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Editor Quick Action Toolbar */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            paddingRight: '10px',
                            paddingLeft: '6px',
                            borderLeft: '1px solid var(--border-color)',
                          }}
                        >
                          {diffState && (
                            <button
                              type="button"
                              onClick={() => setDiffState(null)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Close Git Diff Editor"
                            >
                              Close Diff
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEditorWordWrap((prev) => (prev === 'on' ? 'off' : 'on'))}
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              background: editorWordWrap === 'on' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                              color: editorWordWrap === 'on' ? '#22d3ee' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: editorWordWrap === 'on' ? 'rgba(6, 182, 212, 0.4)' : 'transparent',
                              cursor: 'pointer',
                            }}
                            title="Toggle Word Wrap (Alt+Z)"
                          >
                            Wrap
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditorMinimap((prev) => !prev)}
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              background: editorMinimap ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              color: editorMinimap ? '#34d399' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: editorMinimap ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
                              cursor: 'pointer',
                            }}
                            title="Toggle Minimap"
                          >
                            Map
                          </button>

                          <button
                            type="button"
                            onClick={handleToggleSplitEditor}
                            style={{
                              padding: '3px 6px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              background: isSplitEditor ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                              color: isSplitEditor ? '#c084fc' : 'var(--text-secondary)',
                              border: '1px solid',
                              borderColor: isSplitEditor ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Split Editor Right (Ctrl+\\)"
                          >
                            <SplitSquareHorizontal size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Editor Canvas: Diff / Split / Single */}
                      {diffState ? (
                        <div style={{ flex: 1, position: 'relative' }}>
                          <DiffEditor
                            height="100%"
                            language={diffState.language}
                            theme="vs-dark"
                            original={diffState.original}
                            modified={diffState.modified}
                            onMount={(diffEditor) => {
                              try {
                                const modifiedEditor = diffEditor.getModifiedEditor();
                                if (modifiedEditor) {
                                  modifiedEditor.onDidChangeModelContent(() => {
                                    const currentDiff = diffStateRef.current;
                                    if (currentDiff?.filePath) {
                                      const val = modifiedEditor.getValue();
                                      setFiles((prev) => ({
                                        ...prev,
                                        [currentDiff.filePath]: {
                                          ...prev[currentDiff.filePath],
                                          content: val,
                                        },
                                      }));
                                    }
                                  });
                                }
                              } catch (e) {
                                console.error('DiffEditor listener error:', e);
                              }
                            }}
                            options={{
                              renderSideBySide: true,
                              minimap: { enabled: editorMinimap },
                              fontSize: editorFontSize,
                              wordWrap: editorWordWrap,
                              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                              readOnly: false,
                              originalEditable: false,
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      ) : isSplitEditor ? (
                        <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
                          {/* Pane 1 */}
                          <Panel
                            defaultSize={50}
                            minSize={25}
                            onClick={() => setActivePane(1)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              outline: activePane === 1 ? '1px solid rgba(6, 182, 212, 0.3)' : 'none',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '3px 8px',
                                background: 'rgba(0,0,0,0.25)',
                                fontSize: '0.72rem',
                                color: activePane === 1 ? '#22d3ee' : 'var(--text-secondary)',
                                borderBottom: '1px solid var(--border-color)',
                              }}
                            >
                              <span>Pane 1: {activeFile ? activeFile.split('/').pop() : 'Empty'}</span>
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                              {activeFile && files[activeFile] ? (
                                <Editor
                                  path={activeFile}
                                  height="100%"
                                  language={files[activeFile].language}
                                  theme="vs-dark"
                                  value={files[activeFile].content}
                                  onChange={handleEditorChange}
                                  onMount={handleEditorDidMount}
                                  options={{
                                    minimap: { enabled: editorMinimap },
                                    fontSize: editorFontSize,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                    padding: { top: 8 },
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    formatOnPaste: true,
                                    automaticLayout: true,
                                    wordWrap: editorWordWrap,
                                    tabSize: editorTabSize,
                                    readOnly: workspaceRole === 'VIEWER',
                                  }}
                                />
                              ) : (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                  No file open in Pane 1
                                </div>
                              )}
                            </div>
                          </Panel>

                          <PanelResizeHandle className="resize-handle" style={{ width: '2px', cursor: 'col-resize', background: 'var(--border-color)' }} />

                          {/* Pane 2 */}
                          <Panel
                            defaultSize={50}
                            minSize={25}
                            onClick={() => setActivePane(2)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              outline: activePane === 2 ? '1px solid rgba(168, 85, 247, 0.3)' : 'none',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '3px 8px',
                                background: 'rgba(0,0,0,0.25)',
                                fontSize: '0.72rem',
                                color: activePane === 2 ? '#c084fc' : 'var(--text-secondary)',
                                borderBottom: '1px solid var(--border-color)',
                              }}
                            >
                              <span>Pane 2: {activeFilePane2 ? activeFilePane2.split('/').pop() : 'Empty'}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsSplitEditor(false);
                                  setActivePane(1);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                                title="Close Split View"
                              >
                                ✕
                              </button>
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                              {activeFilePane2 && files[activeFilePane2] ? (
                                <Editor
                                  path={`split-${activeFilePane2}`}
                                  height="100%"
                                  language={files[activeFilePane2].language}
                                  theme="vs-dark"
                                  value={files[activeFilePane2].content}
                                  onChange={(val) => {
                                    if (!activeFilePane2) return;
                                    setFiles((prev) => ({
                                      ...prev,
                                      [activeFilePane2]: {
                                        ...prev[activeFilePane2],
                                        content: val || '',
                                      },
                                    }));
                                  }}
                                  options={{
                                    minimap: { enabled: editorMinimap },
                                    fontSize: editorFontSize,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                    padding: { top: 8 },
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    formatOnPaste: true,
                                    automaticLayout: true,
                                    wordWrap: editorWordWrap,
                                    tabSize: editorTabSize,
                                    readOnly: workspaceRole === 'VIEWER',
                                  }}
                                />
                              ) : (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                  Select a file from Explorer to view in Pane 2
                                </div>
                              )}
                            </div>
                          </Panel>
                        </PanelGroup>
                      ) : (
                        <div style={{ flex: 1, position: 'relative' }}>
                          {activeFile && files[activeFile] ? (
                            <Editor
                              path={activeFile}
                              height="100%"
                              language={files[activeFile].language}
                              theme="vs-dark"
                              value={files[activeFile].content}
                              onChange={handleEditorChange}
                              onMount={handleEditorDidMount}
                              options={{
                                minimap: { enabled: editorMinimap },
                                fontSize: editorFontSize,
                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                padding: { top: 12 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: 'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                formatOnPaste: true,
                                automaticLayout: true,
                                wordWrap: editorWordWrap,
                                tabSize: editorTabSize,
                                readOnly: workspaceRole === 'VIEWER',
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
                      )}
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
                        <AlertCircle
                          size={12}
                          style={{
                            color: markers.some((m) => m.severity === 8)
                              ? '#ef4444'
                              : markers.some((m) => m.severity === 4)
                              ? '#f59e0b'
                              : 'inherit',
                          }}
                        />
                        PROBLEMS
                        {markers.length > 0 && (
                          <span
                            style={{
                              background: markers.some((m) => m.severity === 8)
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(255, 255, 255, 0.1)',
                              color: markers.some((m) => m.severity === 8) ? '#f87171' : '#cbd5e1',
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {markers.length}
                          </span>
                        )}
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
                          title="New Terminal"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: '2px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                          }}
                          onClick={() => handleNewTerminal('default')}
                          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        >
                          <Plus size={14} />
                          <ChevronDownIcon size={12} />
                        </div>
                        <span
                          title="Split Terminal (Side-by-Side)"
                          style={{
                            display: 'flex',
                            cursor: 'pointer',
                            color: isTerminalSplit ? '#c084fc' : 'inherit',
                          }}
                          onClick={handleToggleSplitTerminal}
                          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = isTerminalSplit ? '#c084fc' : 'var(--text-secondary)')
                          }
                        >
                          <SplitSquareHorizontal size={14} />
                        </span>
                        <span
                          title="Kill Terminal"
                          style={{ display: 'flex', cursor: 'pointer' }}
                          onClick={() => handleKillTerminal(activeTerminalId)}
                          onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = 'var(--text-secondary)')
                          }
                        >
                          <Trash size={14} />
                        </span>
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
                      {activeBottomTab === 'terminal' && isTerminalSplit && splitTerminalId ? (
                        <PanelGroup orientation="horizontal" style={{ flex: 1, minHeight: 0 }}>
                          {/* Left Terminal Pane */}
                          <Panel
                            defaultSize={50}
                            minSize={25}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              minHeight: 0,
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                color: '#22d3ee',
                                background: 'rgba(0,0,0,0.3)',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span style={{ fontFamily: 'var(--font-mono)' }}>
                                {terminals.find((t) => t.id === activeTerminalId)?.title || 'Terminal 1'}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  background: 'rgba(6, 182, 212, 0.15)',
                                  color: '#22d3ee',
                                }}
                              >
                                Left
                              </span>
                            </div>
                            <div
                              ref={terminalRef(activeTerminalId)}
                              onClick={() => xtermInstances.current[activeTerminalId]?.term?.focus()}
                              style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}
                            />
                          </Panel>

                          <PanelResizeHandle
                            className="resize-handle"
                            style={{ width: '2px', cursor: 'col-resize', background: 'var(--border-color)' }}
                          />

                          {/* Right Terminal Pane */}
                          <Panel
                            defaultSize={50}
                            minSize={25}
                            style={{ display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}
                          >
                            <div
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                color: '#c084fc',
                                background: 'rgba(0,0,0,0.3)',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span style={{ fontFamily: 'var(--font-mono)' }}>
                                {terminals.find((t) => t.id === splitTerminalId)?.title || 'Terminal 2'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    color: '#c084fc',
                                  }}
                                >
                                  Right
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsTerminalSplit(false)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    padding: '0 2px',
                                  }}
                                  title="Close Split Terminal"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <div
                              ref={terminalRef(splitTerminalId)}
                              onClick={() => xtermInstances.current[splitTerminalId]?.term?.focus()}
                              style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}
                            />
                          </Panel>
                        </PanelGroup>
                      ) : (
                        terminals.map((term) => (
                          <div
                            key={term.id}
                            ref={terminalRef(term.id)}
                            onClick={() => xtermInstances.current[term.id]?.term?.focus()}
                            style={{
                              width: '100%',
                              height: '100%',
                              flex: 1,
                              minHeight: 0,
                              display:
                                activeBottomTab === 'terminal' && activeTerminalId === term.id
                                  ? 'block'
                                  : 'none',
                            }}
                          />
                        ))
                      )}

                      {activeBottomTab === 'output' && (
                        <div
                          style={{
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem',
                            padding: '8px 12px',
                            lineHeight: 1.6,
                          }}
                        >
                          <div style={{ color: '#10b981' }}>✓ [CloudLab Runtime] Environment active.</div>
                          <div>[Workspace] Project: {projectInfo?.name || workspaceId}</div>
                          <div>[Diagnostics] {markers.length} marker(s) reported by compiler.</div>
                          {activeFile && (
                            <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                              [Active File] {activeFile} ({files[activeFile]?.language || 'plaintext'})
                            </div>
                          )}
                        </div>
                      )}

                      {activeBottomTab === 'problems' && (
                        <div
                          style={{
                            height: '100%',
                            overflowY: 'auto',
                            color: 'var(--text-secondary)',
                            fontFamily: 'inherit',
                            fontSize: '0.85rem',
                          }}
                        >
                          {markers.length === 0 ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> No problems detected in workspace files.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px 8px' }}>
                              {Object.entries(
                                markers.reduce((acc: Record<string, typeof markers>, m) => {
                                  const key = m.resource || activeFile || 'Workspace';
                                  if (!acc[key]) acc[key] = [];
                                  acc[key].push(m);
                                  return acc;
                                }, {})
                              ).map(([fileKey, fileMarkers]) => (
                                <div
                                  key={fileKey}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '6px 12px',
                                      background: 'rgba(255, 255, 255, 0.04)',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: 'var(--text-primary)',
                                    }}
                                  >
                                    <FileCode size={13} style={{ color: 'var(--accent-orange)' }} />
                                    <span style={{ flex: 1 }}>{fileKey}</span>
                                    <span
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontFamily: 'var(--font-mono)',
                                      }}
                                    >
                                      {fileMarkers.length}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {fileMarkers.map((prob, pIdx) => {
                                      const isErr = prob.severity === 8;
                                      const isWarn = prob.severity === 4;
                                      return (
                                        <div
                                          key={`${fileKey}-${pIdx}`}
                                          onClick={() =>
                                            handleNavigateToFileAndPosition(
                                              prob.resource || activeFile,
                                              prob.startLineNumber,
                                              prob.startColumn,
                                            )
                                          }
                                          style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px',
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                                            transition: 'background 0.15s',
                                            fontSize: '0.82rem',
                                          }}
                                          onMouseOver={(e) =>
                                            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')
                                          }
                                          onMouseOut={(e) =>
                                            (e.currentTarget.style.background = 'transparent')
                                          }
                                        >
                                          <span style={{ marginTop: '2px', flexShrink: 0 }}>
                                            {isErr ? (
                                              <XCircle size={13} style={{ color: '#ef4444' }} />
                                            ) : isWarn ? (
                                              <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
                                            ) : (
                                              <Info size={13} style={{ color: '#06b6d4' }} />
                                            )}
                                          </span>
                                          <span style={{ color: 'var(--text-primary)', flex: 1 }}>
                                            {prob.message}
                                            {prob.code && (
                                              <span
                                                style={{
                                                  color: 'var(--text-secondary)',
                                                  marginLeft: '6px',
                                                  fontSize: '0.75rem',
                                                }}
                                              >
                                                [{prob.code}]
                                              </span>
                                            )}
                                          </span>
                                          <span
                                            style={{
                                              color: 'var(--text-secondary)',
                                              fontFamily: 'var(--font-mono)',
                                              fontSize: '0.75rem',
                                              whiteSpace: 'nowrap',
                                            }}
                                          >
                                            [{prob.startLineNumber}, {prob.startColumn}]
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar for Terminals */}
                    {activeBottomTab === 'terminal' && terminals.length > 0 && (
                      <div
                        style={{
                          width: '190px',
                          borderLeft: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '6px',
                          background: 'rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 6px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid var(--border-color)',
                            marginBottom: '4px',
                          }}
                        >
                          <span>TERMINALS ({terminals.length})</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleNewTerminal('default')}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '1px',
                              }}
                              title="New Terminal"
                              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={handleToggleSplitTerminal}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: isTerminalSplit ? '#c084fc' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '1px',
                              }}
                              title="Toggle Split Terminal"
                              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                              onMouseOut={(e) =>
                                (e.currentTarget.style.color = isTerminalSplit ? '#c084fc' : 'var(--text-secondary)')
                              }
                            >
                              <SplitSquareHorizontal size={12} />
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            overflowY: 'auto',
                            flex: 1,
                          }}
                        >
                          {terminals.map((term) => (
                            <div
                              key={term.id}
                              onClick={() => {
                                setActiveTerminalId(term.id);
                                setTimeout(() => {
                                  try {
                                    xtermInstances.current[term.id]?.term?.focus();
                                    xtermInstances.current[term.id]?.fitAddon?.fit();
                                  } catch (e) {}
                                }, 50);
                              }}
                              style={{
                                padding: '5px 8px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.78rem',
                                color:
                                  activeTerminalId === term.id
                                    ? '#22d3ee'
                                    : splitTerminalId === term.id && isTerminalSplit
                                    ? '#c084fc'
                                    : 'var(--text-secondary)',
                                background:
                                  activeTerminalId === term.id
                                    ? 'rgba(6, 182, 212, 0.15)'
                                    : splitTerminalId === term.id && isTerminalSplit
                                    ? 'rgba(168, 85, 247, 0.15)'
                                    : 'transparent',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseOver={(e) => {
                                if (activeTerminalId !== term.id && (!isTerminalSplit || splitTerminalId !== term.id)) {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (activeTerminalId !== term.id && (!isTerminalSplit || splitTerminalId !== term.id)) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  flex: 1,
                                  overflow: 'hidden',
                                }}
                              >
                                <TerminalIcon size={12} style={{ flexShrink: 0 }} />
                                {editingTerminalId === term.id ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingTerminalTitle}
                                    onChange={(e) => setEditingTerminalTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameTerminal(term.id, editingTerminalTitle);
                                      if (e.key === 'Escape') setEditingTerminalId(null);
                                    }}
                                    onBlur={() => handleRenameTerminal(term.id, editingTerminalTitle)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      background: 'rgba(0, 0, 0, 0.5)',
                                      border: '1px solid var(--accent-cyan)',
                                      borderRadius: '2px',
                                      color: '#fff',
                                      fontSize: '0.75rem',
                                      padding: '1px 4px',
                                      outline: 'none',
                                      width: '90px',
                                    }}
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTerminalId(term.id);
                                      setEditingTerminalTitle(term.title);
                                    }}
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                    title="Double click to rename"
                                  >
                                    {term.title}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {isTerminalSplit && term.id === activeTerminalId && (
                                  <span
                                    style={{
                                      fontSize: '0.62rem',
                                      padding: '1px 3px',
                                      borderRadius: '2px',
                                      background: 'rgba(6, 182, 212, 0.3)',
                                      color: '#22d3ee',
                                    }}
                                  >
                                    L
                                  </span>
                                )}
                                {isTerminalSplit && term.id === splitTerminalId && (
                                  <span
                                    style={{
                                      fontSize: '0.62rem',
                                      padding: '1px 3px',
                                      borderRadius: '2px',
                                      background: 'rgba(168, 85, 247, 0.3)',
                                      color: '#c084fc',
                                    }}
                                  >
                                    R
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTerminalId(term.id);
                                    setEditingTerminalTitle(term.title);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    borderRadius: '2px',
                                    display: 'flex',
                                  }}
                                  title="Rename Terminal"
                                  onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                >
                                  <Edit2 size={11} />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleKillTerminal(term.id);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    borderRadius: '2px',
                                    display: 'flex',
                                  }}
                                  title="Kill Terminal"
                                  onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                >
                                  <Trash size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
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
              defaultSize={28}
              minSize={20}
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
            background: '#090d16',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            fontSize: '0.75rem',
            fontWeight: 500,
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
                color: '#34d399',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#34d399')}
            >
              <GitBranch size={12} /> main
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> 0 ↓ 0 ↑
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
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

            {/* Real-time Diagnostics (Problems) Indicator */}
            <span
              onClick={() => setActiveBottomTab('problems')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: 0.9,
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '0.9')}
              title={`${markers.filter((m) => m.severity === 8).length} error(s), ${markers.filter((m) => m.severity === 4).length} warning(s)`}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: markers.some((m) => m.severity === 8) ? '#ef4444' : 'var(--text-secondary)',
                }}
              >
                <XCircle size={12} /> {markers.filter((m) => m.severity === 8).length}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: markers.some((m) => m.severity === 4) ? '#f59e0b' : 'var(--text-secondary)',
                }}
              >
                <AlertTriangle size={12} /> {markers.filter((m) => m.severity === 4).length}
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
            >
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span
              onClick={() => setEditorTabSize((prev) => (prev === 2 ? 4 : 2))}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}
              title="Click to toggle Tab Indentation"
            >
              Spaces: {editorTabSize}
            </span>
            <span
              onClick={() => setEditorWordWrap((prev) => (prev === 'on' ? 'off' : 'on'))}
              style={{
                cursor: 'pointer',
                transition: 'color 0.2s',
                color: editorWordWrap === 'on' ? '#22d3ee' : '#94a3b8',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = editorWordWrap === 'on' ? '#22d3ee' : '#94a3b8')
              }
              title="Click to toggle Word Wrap (Alt+Z)"
            >
              Wrap: {editorWordWrap === 'on' ? 'ON' : 'OFF'}
            </span>
            <span
              onClick={() => setEditorMinimap((prev) => !prev)}
              style={{
                cursor: 'pointer',
                transition: 'color 0.2s',
                color: editorMinimap ? '#34d399' : '#94a3b8',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--bg-primary)')}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = editorMinimap ? '#34d399' : '#94a3b8')
              }
              title="Click to toggle Minimap"
            >
              Map: {editorMinimap ? 'ON' : 'OFF'}
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
                  {paletteMode === 'commands' ? '>' : '📁'}
                </div>
                <input
                  type="text"
                  value={commandQuery}
                  onChange={(e) => {
                    setCommandQuery(e.target.value);
                    setSelectedPaletteIndex(0);
                  }}
                  placeholder={
                    paletteMode === 'commands'
                      ? 'Type a command (e.g. Open Folder, Deploy, Git, Terminal)...'
                      : 'Search files by name (e.g. page.tsx, index.js)...'
                  }
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-sans"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaletteMode(paletteMode === 'commands' ? 'files' : 'commands')}
                    className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  >
                    {paletteMode === 'commands' ? 'Switch to Files' : 'Switch to Commands'}
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/5">
                    ESC
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none scrollbar-thin scrollbar-thumb-slate-800">
                {paletteMode === 'commands' ? (
                  /* Commands Mode */
                  COMMAND_ITEMS
                    .filter((cmd) => cmd.label.toLowerCase().includes(commandQuery.toLowerCase()))
                    .map((cmd, idx) => (
                      <div
                        key={cmd.id}
                        onClick={() => executePaletteCommand(cmd.id)}
                        className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          idx === selectedPaletteIndex
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
                        f.path.toLowerCase().includes(commandQuery.toLowerCase()) ||
                        f.name.toLowerCase().includes(commandQuery.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No matching files found for &quot;{commandQuery}&quot;
                        </div>
                      );
                    }

                    return filtered.map((f, idx) => (
                      <div
                        key={f.path}
                        onClick={() => {
                          setShowCommandPalette(false);
                          openFile(f.path);
                        }}
                        className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          idx === selectedPaletteIndex
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
        )}
        {/* Phase 3: Collaborators & Access Modal */}
        {showShareModal && (
          <div
            onClick={() => setShowShareModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0c1426] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Share size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">Workspace Collaborators</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Manage permissions and team access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-white text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {/* Invite Input (Only for Owners) */}
              {workspaceRole === 'OWNER' && (
                <div className="flex flex-col gap-2 bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                  <span className="text-xs font-semibold text-slate-300">Invite Collaborator</span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="bg-black/40 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      onClick={handleInviteMember}
                      disabled={isInviting || !inviteEmail.trim()}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isInviting ? 'Adding...' : 'Invite'}
                    </button>
                  </div>
                </div>
              )}

              {/* Collaborators List */}
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Members & Roles</span>
                {workspaceMembers.owner && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-600/40 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-200">
                        {(workspaceMembers.owner.name || workspaceMembers.owner.email || 'O')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{workspaceMembers.owner.name || 'Owner'}</div>
                        <div className="text-[11px] text-slate-400">{workspaceMembers.owner.email}</div>
                      </div>
                    </div>
                    <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                      OWNER
                    </span>
                  </div>
                )}

                {workspaceMembers.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-cyan-600/40 border border-cyan-500/50 flex items-center justify-center text-xs font-bold text-cyan-200">
                        {(m.user?.name || m.user?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{m.user?.name || 'Member'}</div>
                        <div className="text-[11px] text-slate-400">{m.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                        m.role === 'EDITOR'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {m.role}
                      </span>
                      {workspaceRole === 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5"
                          title="Remove member"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Copy URL */}
              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-slate-400">Share workspace URL directly</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Workspace URL copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Point-in-Time Snapshots & Backups Modal */}
        {showSnapshotModal && (
          <div
            onClick={() => setShowSnapshotModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0c1426] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">Snapshots & Recovery</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Point-in-time workspace rollback and archives</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSnapshotModal(false)}
                  className="text-slate-400 hover:text-white text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {/* Create Snapshot Button */}
              <div className="flex justify-between items-center bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Create New Snapshot</div>
                  <div className="text-[11px] text-slate-400">Captures workspace files instantly</div>
                </div>
                <button
                  onClick={() => handleCreateSnapshot()}
                  disabled={isCreatingSnapshot || workspaceRole === 'VIEWER'}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isCreatingSnapshot ? 'Creating...' : '+ Create Snapshot'}
                </button>
              </div>

              {/* Snapshots List */}
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Snapshots</span>
                {snapshotLoading ? (
                  <div className="text-center py-6 text-xs text-slate-400">Loading snapshots...</div>
                ) : snapshots.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                    No snapshots taken yet. Create a snapshot before making big changes.
                  </div>
                ) : (
                  snapshots.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{s.description || 'Snapshot'}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {new Date(s.createdAt).toLocaleString()} • {(s.sizeBytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreSnapshot(s.id)}
                          disabled={workspaceRole === 'VIEWER'}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium transition-colors"
                        >
                          Restore
                        </button>
                        {workspaceRole === 'OWNER' && (
                          <button
                            onClick={() => handleDeleteSnapshot(s.id)}
                            className="px-2 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-lg text-xs transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
