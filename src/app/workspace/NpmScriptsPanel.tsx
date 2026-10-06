'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  RefreshCw,
  Terminal,
  FileCode,
  Package,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Code2,
} from 'lucide-react';

interface NpmScriptsPanelProps {
  workspaceId: string;
  onRunScript: (scriptName: string, command: string) => void;
  onOpenFile?: (filePath: string) => void;
}

interface ScriptsData {
  hasPackageJson: boolean;
  name: string;
  version: string;
  packageManager: string;
  scripts: Record<string, string>;
  dependencyCount: number;
}

export default function NpmScriptsPanel({
  workspaceId,
  onRunScript,
  onOpenFile,
}: NpmScriptsPanelProps) {
  const [data, setData] = useState<ScriptsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspace/scripts?id=${encodeURIComponent(workspaceId)}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to load npm scripts:', e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const scriptEntries = data?.scripts ? Object.entries(data.scripts) : [];
  const filteredScripts = scriptEntries.filter(([name, cmd]) => {
    const q = filterQuery.toLowerCase();
    return name.toLowerCase().includes(q) || cmd.toLowerCase().includes(q);
  });

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(10, 15, 29, 0.4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsCollapsed((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          background: 'rgba(0, 0, 0, 0.2)',
          transition: 'background 0.15s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          <Package size={13} style={{ color: '#06b6d4' }} />
          <span>NPM SCRIPTS</span>
          {data?.hasPackageJson && scriptEntries.length > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                fontWeight: 600,
              }}
            >
              {scriptEntries.length}
            </span>
          )}
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {data?.hasPackageJson && onOpenFile && (
            <button
              type="button"
              onClick={() => onOpenFile('package.json')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Open package.json"
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FileCode size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={fetchScripts}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: loading ? 'default' : 'pointer',
              padding: '2px',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Refresh NPM Scripts"
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 10px 10px 10px' }}>
          {loading && !data ? (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}
            >
              Scanning package.json...
            </div>
          ) : !data?.hasPackageJson ? (
            <div
              style={{
                padding: '10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div>No package.json detected in root.</div>
              <button
                type="button"
                onClick={() => onRunScript('init', 'npm init -y')}
                style={{
                  marginTop: '8px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#22d3ee',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Run `npm init -y`
              </button>
            </div>
          ) : scriptEntries.length === 0 ? (
            <div
              style={{
                padding: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              No "scripts" defined in package.json.
            </div>
          ) : (
            <>
              {/* Optional Search if more than 4 scripts */}
              {scriptEntries.length > 4 && (
                <div
                  style={{
                    position: 'relative',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Search
                    size={11}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter scripts..."
                    style={{
                      width: '100%',
                      padding: '4px 6px 4px 24px',
                      fontSize: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Script Rows */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {filteredScripts.map(([scriptName, cmd]) => (
                  <div
                    key={scriptName}
                    className="group"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')
                    }
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() =>
                      onRunScript(
                        scriptName,
                        `${data.packageManager || 'npm'} run ${scriptName}`,
                      )
                    }
                    title={`${data.packageManager || 'npm'} run ${scriptName}\nCommand: ${cmd}`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRunScript(
                            scriptName,
                            `${data.packageManager || 'npm'} run ${scriptName}`,
                          );
                        }}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={`Run "${scriptName}"`}
                      >
                        <Play size={10} fill="#34d399" />
                      </button>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            color: '#e2e8f0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {scriptName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {cmd}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        paddingLeft: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {data.packageManager}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
