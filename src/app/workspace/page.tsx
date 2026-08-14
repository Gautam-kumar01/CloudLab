'use client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { 
  Folder, FileCode, FileJson, FileType2, Terminal as TerminalIcon, 
  Play, Share, Settings, Code2, MessageSquare, AlertCircle,
  FilePlus, FolderPlus, RefreshCw, ChevronsDown, ChevronRight, ChevronDown,
  Plus, Trash, SplitSquareHorizontal, ChevronDown as ChevronDownIcon, GitBranch, Files
} from 'lucide-react';

import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';
import GitPanel from './GitPanel';

const FileTreeNode = ({ node, level, expandedFolders, setExpandedFolders, activeFile, openFile }: any) => {
  const isExpanded = expandedFolders[node.path];

  const toggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev: any) => ({ ...prev, [node.path]: !prev[node.path] }));
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileCode size={14} color="#61dafb" />;
    if (filename.endsWith('.json')) return <FileJson size={14} color="#f1e05a" />;
    if (filename.endsWith('.css')) return <FileType2 size={14} color="#563d7c" />;
    return <FileCode size={14} color="#888" />;
  };

  if (node.type === 'directory') {
    return (
      <div style={{ userSelect: 'none' }}>
        <div 
          onClick={toggleFolder}
          style={{
            padding: '4px 8px',
            paddingLeft: `${level * 12 + 8}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} color="#dcb67a" fill="#dcb67a" />
          {node.name}
        </div>
        {isExpanded && node.children && (
          <div>
            {Object.values(node.children).map((child: any) => (
              <FileTreeNode key={child.path} node={child} level={level + 1} expandedFolders={expandedFolders} setExpandedFolders={setExpandedFolders} activeFile={activeFile} openFile={openFile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={() => openFile(node.path, node)}
      style={{
        padding: '4px 8px',
        paddingLeft: `${level * 12 + 8 + 20}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: activeFile === node.path ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: activeFile === node.path ? 'var(--bg-secondary)' : 'transparent',
        fontSize: '0.85rem'
      }}
      onMouseOver={e => { if (activeFile !== node.path) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
      onMouseOut={e => { if (activeFile !== node.path) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
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
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, { name: string, language: string, content: string }>>({});
  const [activeFile, setActiveFile] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'git'>('explorer');

  type TerminalState = { id: string, title: string, shellType: string };
  const [terminals, setTerminals] = useState<TerminalState[]>([{ id: 'term-1', title: 'powershell', shellType: 'powershell' }]);
  const [activeTerminalId, setActiveTerminalId] = useState('term-1');
  
  const socketRef = useRef<Socket | null>(null);
  const xtermInstances = useRef<Record<string, { term: XTerm, fitAddon: FitAddon, container: HTMLDivElement }>>({});
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openFile = async (path: string, node: any) => {
    if (files[path]) {
      setActiveFile(path);
      return;
    }
    try {
      const res = await fetch(`/api/workspace/file?id=${encodeURIComponent(workspaceId)}&filename=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFiles(prev => ({
          ...prev,
          [path]: { name: node.name, language: node.language, content: data.content }
        }));
        setActiveFile(path);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`/api/workspace/files?id=${encodeURIComponent(workspaceId)}`);
      const data = await res.json();
      if (!data.error) {
        setFileTree(data);
        if (data['index.ts'] && data['index.ts'].type === 'file') {
          openFile('index.ts', data['index.ts']);
        } else {
          const firstKey = Object.keys(data).find(k => data[k].type === 'file');
          if (firstKey) openFile(firstKey, data[firstKey]);
        }
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
          content: specificContent !== undefined ? specificContent : files[fileToSave].content
        })
      });
      console.log('Saved', fileToSave);
      if (!specificFile) setActiveMenu(null); // Close menu if open manually
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewFile = async () => {
    const filename = prompt('Enter new filename (e.g., component.tsx or folder/file.ts):');
    if (!filename) return;
    
    try {
      await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          filename,
          content: '',
          isDir: false
        })
      });
      await fetchWorkspace();
      setActiveMenu(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewFolder = async () => {
    const foldername = prompt('Enter new folder name:');
    if (!foldername) return;
    try {
      await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          filename: foldername + '/',
          content: '',
          isDir: true
        })
      });
      await fetchWorkspace();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFile = async () => {
    if (!activeFile) return;
    if (!confirm(`Are you sure you want to delete ${activeFile}?`)) return;

    try {
      await fetch(`/api/workspace/files?id=${encodeURIComponent(workspaceId)}&filename=${encodeURIComponent(activeFile)}`, {
        method: 'DELETE'
      });
      
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[activeFile];
        return newFiles;
      });
      
      // Select another open file
      const remainingFiles = Object.keys(files).filter(f => f !== activeFile);
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

  const handleGitPush = async () => {
    const message = prompt('Enter commit message:');
    if (message === null) return;
    
    try {
      setIsSaving(true); // Reusing isSaving to show network activity
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, message })
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
        setShowCommandPalette(prev => !prev);
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
    // 1. Initialize Socket.io
    const socket = io({ path: '/socket.io' });
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
      socketRef.current.emit('terminal.spawn', { id: 'term-1', shellType: 'powershell', workspaceId });
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
    setTerminals(prev => [...prev, { id, title: shellType, shellType }]);
    setActiveTerminalId(id);
    setActiveBottomTab('terminal');
    socketRef.current?.emit('terminal.spawn', { id, shellType, workspaceId });
  };

  const handleKillTerminal = (id: string) => {
    socketRef.current?.emit('terminal.kill', { id });
    setTerminals(prev => {
      const newTerms = prev.filter(t => t.id !== id);
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
      setFiles(prev => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content: value }
      }));

      // Debounced Autosave
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave(activeFile, value);
      }, 1500); // 1.5 second debounce
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
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileCode size={14} color="#61dafb" />;
    if (filename.endsWith('.json')) return <FileJson size={14} color="#f1e05a" />;
    if (filename.endsWith('.css')) return <FileType2 size={14} color="#563d7c" />;
    return <FileCode size={14} color="#888" />;
  };

  return (
    <>
      {/* Mobile Warning Overlay */}
      <div className="mobile-warning" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-primary)', zIndex: 100, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-orange)', marginBottom: '8px', fontWeight: 'bold' }}>Desktop Required</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The CloudLab IDE Shell is optimized for laptop and desktop screens. Please resize your window or switch to a larger device.</p>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-warning { display: flex !important; }
          .workspace-container { display: none !important; }
        }
        .resize-handle {
          background-color: var(--border-color);
          transition: background-color 0.2s ease;
        }
        .resize-handle:hover, .resize-handle:active {
          background-color: var(--accent-green);
        }
        .xterm .xterm-viewport {
          /* Hide scrollbar for xterm */
          overflow-y: hidden !important;
        }
      `}</style>

      <div className="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
        {/* Top Bar */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '48px', padding: '0 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{ fontWeight: 'bold', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} /> CL
            </Link>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
              
              <div style={{ position: 'relative' }}>
                <span onClick={(e) => handleMenuClick(e, 'file')} style={{ cursor: 'pointer', transition: 'color 0.2s', color: activeMenu === 'file' ? '#fff' : 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => {if(activeMenu !== 'file') e.currentTarget.style.color = 'var(--text-secondary)'}}>File</span>
                {activeMenu === 'file' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', minWidth: '150px', zIndex: 10 }}>
                    <div onClick={handleNewFile} style={{ padding: '8px 16px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>New File</div>
                    <div onClick={() => handleSave()} style={{ padding: '8px 16px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Save</div>
                    <a href={`/api/workspace/export?id=${encodeURIComponent(workspaceId)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '8px 16px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Download Workspace (ZIP)</a>
                    <div onClick={handleDeleteFile} style={{ padding: '8px 16px', cursor: 'pointer', color: 'var(--accent-orange)' }} onMouseOver={e => {e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--accent-orange)';}} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Delete File</div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <span onClick={(e) => handleMenuClick(e, 'edit')} style={{ cursor: 'pointer', transition: 'color 0.2s', color: activeMenu === 'edit' ? '#fff' : 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => {if(activeMenu !== 'edit') e.currentTarget.style.color = 'var(--text-secondary)'}}>Edit</span>
                {activeMenu === 'edit' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', minWidth: '150px', zIndex: 10 }}>
                    <div style={{ padding: '8px 16px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Undo</div>
                    <div style={{ padding: '8px 16px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Redo</div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <span onClick={(e) => handleMenuClick(e, 'view')} style={{ cursor: 'pointer', transition: 'color 0.2s', color: activeMenu === 'view' ? '#fff' : 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => {if(activeMenu !== 'view') e.currentTarget.style.color = 'var(--text-secondary)'}}>View</span>
                {activeMenu === 'view' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', minWidth: '150px', zIndex: 10 }}>
                    <div style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => setShowCommandPalette(true)} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Command Palette</div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <span onClick={(e) => handleMenuClick(e, 'git')} style={{ cursor: 'pointer', transition: 'color 0.2s', color: activeMenu === 'git' ? '#fff' : 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => {if(activeMenu !== 'git') e.currentTarget.style.color = 'var(--text-secondary)'}}>Source Control</span>
                {activeMenu === 'git' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', minWidth: '150px', zIndex: 10 }}>
                    <div onClick={handleGitPush} style={{ padding: '8px 16px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Commit & Push</div>
                  </div>
                )}
              </div>

            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            react-ecommerce
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--border-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}>
              <Share size={14} /> Share
            </button>
            <button onClick={handleRunCommand} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', border: 'none', fontWeight: 600, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              <Play size={14} fill="currentColor" /> Run
            </button>
          </div>
        </nav>

        {/* Main Layout using Resizable Panels */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Activity Bar (Far Left) */}
          <div style={{ width: '48px', height: '100%', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '16px' }}>
            <div 
              onClick={() => setActiveSidebar('explorer')}
              style={{ cursor: 'pointer', opacity: activeSidebar === 'explorer' ? 1 : 0.5, borderLeft: activeSidebar === 'explorer' ? '2px solid var(--accent-orange)' : '2px solid transparent', padding: '8px', transition: 'all 0.2s' }}
              title="Explorer"
            >
              <Files size={24} />
            </div>
            <div 
              onClick={() => setActiveSidebar('git')}
              style={{ cursor: 'pointer', opacity: activeSidebar === 'git' ? 1 : 0.5, borderLeft: activeSidebar === 'git' ? '2px solid var(--accent-orange)' : '2px solid transparent', padding: '8px', transition: 'all 0.2s' }}
              title="Source Control"
            >
              <GitBranch size={24} />
            </div>
          </div>

          <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
            
            {/* Sidebar (Explorer / Git) */}
            <Panel defaultSize={20} minSize={15} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}>
              {activeSidebar === 'explorer' ? (
                <>
                  <div style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      EXPLORER
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FilePlus size={14} style={{ cursor: 'pointer' }} onClick={handleNewFile} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} />
                      <FolderPlus size={14} style={{ cursor: 'pointer' }} onClick={handleNewFolder} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} />
                      <RefreshCw size={14} style={{ cursor: 'pointer' }} onClick={fetchWorkspace} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} />
                      <ChevronsDown size={14} style={{ cursor: 'pointer' }} onClick={() => setExpandedFolders({})} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} />
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                    {Object.keys(fileTree).length > 0 ? (
                      Object.values(fileTree).map((node: any) => (
                        <FileTreeNode 
                          key={node.path} 
                          node={node} 
                          level={0} 
                          expandedFolders={expandedFolders} 
                          setExpandedFolders={setExpandedFolders} 
                          activeFile={activeFile} 
                          openFile={openFile} 
                        />
                      ))
                    ) : (
                      <div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                        Loading workspace...
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      SOURCE CONTROL
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <GitPanel workspaceId={workspaceId} />
                  </div>
                </>
              )}
            </Panel>

            <PanelResizeHandle className="resize-handle" style={{ width: '1px', cursor: 'col-resize' }} />

            {/* Center Area (Editor + Terminal) */}
            <Panel defaultSize={65} minSize={30} style={{ display: 'flex', flexDirection: 'column' }}>
              <PanelGroup orientation="vertical">
                
                {/* Editor Panel */}
                <Panel defaultSize={70} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                  {/* Editor Tabs */}
                  <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
                    {Object.keys(files).map(filename => (
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
                          background: activeFile === filename ? 'var(--bg-primary)' : 'transparent',
                          color: activeFile === filename ? 'var(--text-primary)' : 'var(--text-secondary)',
                          borderTop: activeFile === filename ? '2px solid var(--accent-green)' : '2px solid transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => { if (activeFile !== filename) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                        onMouseOut={e => { if (activeFile !== filename) e.currentTarget.style.background = 'transparent'; }}
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
                        height="100%"
                        language={files[activeFile].language}
                        theme="vs-dark"
                        value={files[activeFile].content}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: 'var(--font-mono)',
                          padding: { top: 16 },
                          scrollBeyondLastLine: false,
                          smoothScrolling: true,
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: "on",
                          formatOnPaste: true,
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        Loading workspace...
                      </div>
                    )}
                  </div>
                </Panel>

                <PanelResizeHandle className="resize-handle" style={{ height: '1px', cursor: 'row-resize' }} />

                {/* Terminal Panel */}
                <Panel defaultSize={30} minSize={10} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }} onResize={() => { if (xtermInstances.current[activeTerminalId]) xtermInstances.current[activeTerminalId].fitAddon.fit(); }}>
                  <div style={{ display: 'flex', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span onClick={() => setActiveBottomTab('terminal')} style={{ color: activeBottomTab === 'terminal' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeBottomTab === 'terminal' ? '1px solid var(--accent-green)' : '1px solid transparent', cursor: 'pointer', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TerminalIcon size={12} /> TERMINAL
                      </span>
                      <span onClick={() => setActiveBottomTab('output')} style={{ color: activeBottomTab === 'output' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeBottomTab === 'output' ? '1px solid var(--accent-green)' : '1px solid transparent', cursor: 'pointer', paddingBottom: '4px', transition: 'color 0.2s' }}>OUTPUT</span>
                      <span onClick={() => setActiveBottomTab('problems')} style={{ color: activeBottomTab === 'problems' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeBottomTab === 'problems' ? '1px solid var(--accent-green)' : '1px solid transparent', cursor: 'pointer', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                        <AlertCircle size={12} /> PROBLEMS
                      </span>
                    </div>
                    {activeBottomTab === 'terminal' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '2px' }} onClick={() => handleNewTerminal('powershell')} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                          <Plus size={14} />
                          <ChevronDownIcon size={12} />
                        </div>
                        <SplitSquareHorizontal size={14} style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} />
                        <Trash size={14} style={{ cursor: 'pointer' }} onClick={() => handleKillTerminal(activeTerminalId)} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    
                    {/* Main Content Area */}
                    <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      {activeBottomTab === 'terminal' && terminals.length === 0 && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No active terminals. Click + to spawn one.</div>
                      )}
                      {terminals.map(term => (
                        <div 
                          key={term.id} 
                          ref={terminalRef(term.id)} 
                          style={{ width: '100%', height: '100%', display: activeBottomTab === 'terminal' && activeTerminalId === term.id ? 'block' : 'none' }} 
                        />
                      ))}
                      
                      {activeBottomTab === 'output' && (
                        <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          [Info] Code Analyzer starting up...<br/>
                          [Info] Workspace parsed successfully.<br/>
                          [Info] 0 errors, 0 warnings.
                        </div>
                      )}

                      {activeBottomTab === 'problems' && (
                        <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          No problems have been detected in the workspace.
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar for Terminals */}
                    {activeBottomTab === 'terminal' && terminals.length > 0 && (
                      <div style={{ width: '180px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '8px' }}>
                        {terminals.map(term => (
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
                              color: activeTerminalId === term.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                              background: activeTerminalId === term.id ? 'var(--bg-tertiary)' : 'transparent',
                            }}
                            onMouseOver={e => { if (activeTerminalId !== term.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                            onMouseOut={e => { if (activeTerminalId !== term.id) e.currentTarget.style.background = 'transparent'; }}
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

            <PanelResizeHandle className="resize-handle" style={{ width: '1px', cursor: 'col-resize' }} />

            {/* Right Panel (AI/Chat) */}
            <Panel defaultSize={20} minSize={15} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}>
              <div style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="var(--accent-purple)" />
                AI Assistant
              </div>
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '4px' }}>CloudLab AI</strong>
                  Welcome to Phase 6! The terminal below is now a fully functioning shell connected to your local environment. Try running `node index.ts` or click the Run button above!
                </div>
              </div>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                <input 
                  type="text" 
                  placeholder="Ask AI..." 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </Panel>

          </PanelGroup>
        </div>

        {/* Status Bar */}

          <footer style={{ height: '24px', background: 'var(--accent-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: '0.75rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>
                <GitBranch size={12} /> main
              </span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>
                <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> 0 ↓ 0 ↑
              </span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>
                <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> 0
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>Ln 1, Col 1</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>UTF-8</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>{activeFile && files[activeFile] ? (files[activeFile].language === 'typescript' ? 'TypeScript' : (files[activeFile].language || 'JSON')) : ''}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.color = '#fff'}>
                <Settings size={12} /> Prettier
              </span>
              {isSaving && (
                <span style={{ color: 'var(--bg-primary)' }}>Saving...</span>
              )}
            </div>
          </footer>

        {showCommandPalette && (
          <div onClick={() => setShowCommandPalette(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', paddingTop: '96px', zIndex: 50 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '600px', height: '300px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <input type="text" placeholder="> Type a command..." autoFocus style={{ padding: '16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', width: '100%' }} />
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>recently used</div>
                <div style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                  <span style={{ fontSize: '0.85rem' }}>Format Document</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Shift+Alt+F</span>
                </div>
                <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', color: 'var(--text-secondary)' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
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
