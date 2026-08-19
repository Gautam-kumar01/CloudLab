import React, { useState, useRef } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';

interface PreviewPanelProps {
  workspaceId: string;
  onClose: () => void;
}

export default function PreviewPanel({ workspaceId, onClose }: PreviewPanelProps) {
  // Defaulting to a common dev port, e.g. 3001 or 5173
  const [port, setPort] = useState('3001');
  const [url, setUrl] = useState(`http://localhost:${port}`);
  const [inputUrl, setInputUrl] = useState(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getPreviewUrl = (p: string) => {
    // In MVP, we map to localhost directly. 
    // Later, this could call an API to fetch a proxy URL based on the workspaceId.
    return `http://localhost:${p}`;
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank');
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = new URL(inputUrl);
      if (parsed.port) {
        setPort(parsed.port);
      }
      setUrl(inputUrl);
    } catch {
      // If it's just a port number
      if (/^\d+$/.test(inputUrl)) {
        setPort(inputUrl);
        const newUrl = getPreviewUrl(inputUrl);
        setUrl(newUrl);
        setInputUrl(newUrl);
      } else {
        alert("Please enter a valid URL or a port number.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Globe size={16} color="var(--text-secondary)" />
          <form onSubmit={handleUrlSubmit} style={{ flex: 1, display: 'flex' }}>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              style={{
                flex: 1,
                padding: '4px 12px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%'
              }}
              placeholder="Enter URL or port (e.g. 3001)"
            />
          </form>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleRefresh}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            title="Refresh"
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={handleOpenExternal}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            title="Open in New Tab"
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ExternalLink size={16} />
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1rem', padding: '0 4px' }}
            title="Close Preview"
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            &times;
          </button>
        </div>
      </div>
      <div style={{ flex: 1, background: '#fff' }}>
        <iframe 
          ref={iframeRef}
          src={url} 
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="App Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
