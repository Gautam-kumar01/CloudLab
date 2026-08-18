'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import { MessageSquare, Send, Bot, User, Trash2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AiChatPanel({ 
  activeFile, 
  fileContent,
  workspaceId
}: { 
  activeFile: string;
  fileContent: string;
  workspaceId: string;
}) {
  const [input, setInput] = useState('');
  const { messages, isLoading, stop, setMessages, append, addToolResult } = useChat({
    api: '/api/chat',
    body: { workspaceId },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // We can expose an imperative handle if we want the parent to trigger actions, 
  // but for simplicity we'll let the parent use a custom event or context, 
  // or pass down a function that sets the input.
  // We'll listen for a custom window event for actions like "Explain Code"
  useEffect(() => {
    const handleAiAction = (e: CustomEvent) => {
      const { action, text, context } = e.detail;
      let prompt = '';
      if (action === 'explain') {
        prompt = `Please explain the following code from ${context || 'the editor'}:\n\n\`\`\`\n${text}\n\`\`\``;
      } else if (action === 'fix') {
        prompt = `Please fix the errors in the following code from ${context || 'the editor'}:\n\n\`\`\`\n${text}\n\`\`\``;
      }
      if (prompt) {
        append({ role: 'user', content: prompt });
      }
    };

    window.addEventListener('ai-action', handleAiAction as EventListener);
    return () => {
      window.removeEventListener('ai-action', handleAiAction as EventListener);
    };
  }, [append]);

  const clearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(input || '').trim()) return;
    
    append({ role: 'user', content: input });
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-tertiary)' }}>
      <div style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="var(--accent-purple)" />
          AI Assistant
        </div>
          <div title="Clear Chat" style={{ display: 'flex' }}>
            <Trash2 
              size={18} 
              style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
              onClick={() => setMessages([])}
            />
          </div>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '4px' }}>CloudLab AI</strong>
            Welcome! I can help you write code, find bugs, or explain concepts. Ask me anything or right-click code in the editor for quick actions.
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: m.role === 'user' ? 'var(--text-primary)' : 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 600 }}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              {m.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-primary)', 
              lineHeight: 1.5,
              background: m.role === 'user' ? 'var(--bg-secondary)' : 'transparent',
              padding: m.role === 'user' ? '8px 12px' : '0',
              borderRadius: '6px',
              border: m.role === 'user' ? '1px solid var(--border-color)' : 'none'
            }} className="markdown-body">
              {m.role === 'user' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              ) : (
                <ReactMarkdown
                  components={{
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return (
                        <code className={className} style={{ background: '#000', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }} {...props}>
                          {children}
                        </code>
                      )
                    },
                    pre({node, children, ...props}) {
                      return (
                        <pre style={{ background: '#000', padding: '12px', borderRadius: '6px', overflowX: 'auto', border: '1px solid var(--border-color)', margin: '8px 0' }} {...props}>
                          {children}
                        </pre>
                      )
                    }
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              )}
            </div>

            {m.toolInvocations && m.toolInvocations.map(toolInvocation => {
              const toolCallId = toolInvocation.toolCallId;
              
              if (toolInvocation.toolName === 'readFile' || toolInvocation.toolName === 'listDirectory') {
                return (
                  <div key={toolCallId} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '4px 8px', background: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
                    Agent {toolInvocation.toolName === 'readFile' ? 'read file' : 'listed directory'}: <code>{toolInvocation.args.path}</code>
                  </div>
                );
              }

              if (toolInvocation.toolName === 'writeFile' || toolInvocation.toolName === 'runCommand') {
                const isWriting = toolInvocation.toolName === 'writeFile';
                return (
                  <div key={toolCallId} style={{ 
                    background: 'var(--bg-primary)', 
                    border: '1px solid var(--accent-orange)', 
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-orange)', fontWeight: 600, fontSize: '0.85rem' }}>
                      ⚠ Agent wants to {isWriting ? 'modify a file' : 'run a command'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', background: '#000', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>
                      {isWriting ? (
                        <>
                          <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>File: {toolInvocation.args.path}</div>
                          <pre style={{ margin: 0 }}>{toolInvocation.args.content}</pre>
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-primary)' }}>{toolInvocation.args.command}</div>
                      )}
                    </div>
                    
                    {'result' in toolInvocation ? (
                      <div style={{ fontSize: '0.8rem', color: toolInvocation.result.includes('Rejected') ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>
                        Status: {toolInvocation.result.substring(0, 100)}{toolInvocation.result.length > 100 ? '...' : ''}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          onClick={() => addToolResult({ toolCallId, result: 'User rejected the request.' })}
                          style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => addToolResult({ toolCallId, result: 'APPROVED' })}
                          style={{ flex: 1, padding: '6px', background: 'var(--accent-orange)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Bot size={14} className="animate-pulse" /> AI is thinking...
            <div title="Stop generating" style={{ display: 'flex' }}>
              <StopCircle size={14} style={{ cursor: 'pointer', color: 'var(--accent-orange)' }} onClick={stop} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeFile ? `Ask about ${activeFile.split('/').pop()}...` : "Ask AI..."}
            style={{ 
              flex: 1, 
              padding: '10px 12px', 
              borderRadius: '6px', 
              background: 'var(--bg-primary)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)', 
              outline: 'none', 
              fontSize: '0.85rem', 
              transition: 'border-color 0.2s' 
            }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !(input || '').trim()}
            style={{
              padding: '0 16px',
              borderRadius: '6px',
              background: 'var(--accent-purple)',
              color: '#fff',
              border: 'none',
              cursor: isLoading || !(input || '').trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !(input || '').trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
          </button>
        </form>
        {activeFile && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
            Context: {activeFile.split('/').pop()}
          </div>
        )}
      </div>
    </div>
  );
}
