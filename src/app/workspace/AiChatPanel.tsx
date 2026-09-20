'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Trash2,
  StopCircle,
  Sparkles,
  Code2,
  Check,
  Copy,
  Terminal,
  FileCode,
  AlertTriangle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AiChatPanel({
  activeFile,
  fileContent,
  workspaceId,
}: {
  activeFile: string;
  fileContent: string;
  workspaceId: string;
}) {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const { messages, isLoading, stop, setMessages, append, addToolResult } = useChat({
    api: '/api/chat',
    body: { workspaceId },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Listen for custom editor actions (e.g. "Explain Code", "Fix Code")
  useEffect(() => {
    const handleAiAction = (e: CustomEvent) => {
      const { action, text, context } = e.detail;
      let prompt = '';
      if (action === 'explain') {
        prompt = `Please explain the following code from ${context || 'the editor'}:\n\n\`\`\`\n${text}\n\`\`\``;
      } else if (action === 'fix') {
        prompt = `Please fix any errors in the following code from ${context || 'the editor'}:\n\n\`\`\`\n${text}\n\`\`\``;
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(input || '').trim() || isLoading) return;

    append({ role: 'user', content: input });
    setInput('');
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isLoading) return;
    append({ role: 'user', content: promptText });
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeFileName = activeFile ? activeFile.split('/').pop() || activeFile : '';

  return (
    <div className="flex flex-col h-full bg-[#0b1120] text-slate-100 border-l border-white/5 select-text">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0d1527]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
              CloudLab AI
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Workspace Copilot</div>
          </div>
        </div>

        <button
          type="button"
          title="Clear Chat History"
          onClick={() => {
            if (confirm('Clear chat history?')) setMessages([]);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#111c35] to-[#0d162b] p-4 rounded-xl border border-emerald-500/20 shadow-lg shadow-black/40">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-xs">
                <Bot size={16} />
                Welcome to CloudLab AI Assistant
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                I can explain code, generate boilerplate, fix runtime bugs, or run terminal commands directly in your workspace.
              </p>
              {activeFileName && (
                <div className="inline-flex items-center gap-1.5 text-[11px] bg-slate-900/80 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-300 font-mono">
                  <FileCode size={13} /> Active: {activeFileName}
                </div>
              )}
            </div>

            {/* Quick Action Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-1">
                Suggested Actions
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {activeFileName ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Please explain the architecture and key logic of ${activeFileName}`)}
                      className="text-left text-xs bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-lg text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-2 group"
                    >
                      <Code2 size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Explain <strong>{activeFileName}</strong></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Inspect ${activeFileName} and find any potential bugs, memory leaks, or syntax errors.`)}
                      className="text-left text-xs bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-lg text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-2 group"
                    >
                      <Sparkles size={14} className="text-teal-400 group-hover:scale-110 transition-transform" />
                      <span>Find bugs & optimizations</span>
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('List all files in the current workspace and explain the project structure.')}
                  className="text-left text-xs bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-lg text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-2 group"
                >
                  <Terminal size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Explore workspace directory</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((m, mIdx) => (
          <div key={m.id || mIdx} className="space-y-1.5">
            {/* Author label */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              {m.role === 'user' ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <User size={10} />
                  </div>
                  <span className="text-emerald-400">You</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                    <Bot size={10} />
                  </div>
                  <span className="text-teal-300">CloudLab AI</span>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`text-xs leading-relaxed rounded-xl p-3.5 ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 text-slate-100 rounded-tr-sm shadow-sm'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-md'
              }`}
            >
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap">{m.content}</div>
              ) : (
                <div className="prose prose-invert prose-xs max-w-none space-y-2">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const codeId = `code-${m.id}-${codeString.slice(0, 10)}`;

                        if (match) {
                          return (
                            <div className="my-2.5 rounded-lg overflow-hidden border border-slate-700/80 bg-[#050811] shadow-inner">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                                <span>{match[1]}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(codeString, codeId)}
                                  className="flex items-center gap-1 hover:text-white transition-colors text-slate-400"
                                >
                                  {copiedIndex === codeId ? (
                                    <>
                                      <Check size={11} className="text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-normal m-0 bg-transparent">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        }

                        return (
                          <code
                            className="bg-slate-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-800 text-[11px] font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>;
                      },
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Tool Invocations */}
            {m.toolInvocations &&
              m.toolInvocations.map((toolInvocation) => {
                const toolCallId = toolInvocation.toolCallId;

                if (
                  toolInvocation.toolName === 'readFile' ||
                  toolInvocation.toolName === 'listDirectory'
                ) {
                  return (
                    <div
                      key={toolCallId}
                      className="text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800/90 inline-flex items-center gap-2 max-w-full truncate"
                    >
                      <Terminal size={12} className="text-cyan-400 shrink-0" />
                      <span>
                        Agent {toolInvocation.toolName === 'readFile' ? 'inspected file' : 'listed'}:{' '}
                        <code className="text-emerald-300 font-mono">{toolInvocation.args.path}</code>
                      </span>
                    </div>
                  );
                }

                if (
                  toolInvocation.toolName === 'writeFile' ||
                  toolInvocation.toolName === 'runCommand'
                ) {
                  const isWriting = toolInvocation.toolName === 'writeFile';
                  return (
                    <div
                      key={toolCallId}
                      className="bg-[#0f172a] border border-amber-500/40 rounded-xl p-3.5 space-y-2.5 shadow-lg shadow-black/50"
                    >
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                        <AlertTriangle size={15} />
                        <span>Approval Required: {isWriting ? 'Modify Workspace File' : 'Execute Command'}</span>
                      </div>

                      <div className="bg-[#050811] rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                        {isWriting ? (
                          <>
                            <div className="text-emerald-400 font-bold mb-1">
                              File: {toolInvocation.args.path}
                            </div>
                            <pre className="text-slate-300 m-0 max-h-36 overflow-y-auto">
                              {toolInvocation.args.content}
                            </pre>
                          </>
                        ) : (
                          <div className="text-cyan-300 font-bold">
                            $ {toolInvocation.args.command}
                          </div>
                        )}
                      </div>

                      {'result' in toolInvocation ? (
                        <div
                          className={`text-[11px] font-mono px-2 py-1 rounded ${
                            String(toolInvocation.result).includes('Rejected')
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          Status: {String(toolInvocation.result).substring(0, 120)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              addToolResult({
                                toolCallId,
                                result: 'User rejected the request.',
                              })
                            }
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              addToolResult({
                                toolCallId,
                                result: 'APPROVED',
                              })
                            }
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                          >
                            Approve Action
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400 animate-spin" />
              <span className="text-slate-300 font-medium">Generating response...</span>
            </div>
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition-colors"
            >
              <StopCircle size={12} />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="p-3.5 bg-[#090e1a]/95 backdrop-blur-md border-t border-white/10 shadow-2xl space-y-2">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center bg-[#0f172a] border border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeFileName ? `Ask about ${activeFileName}...` : 'Ask CloudLab AI anything...'
              }
              disabled={isLoading}
              className="w-full bg-transparent px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 outline-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !(input || '').trim()}
            className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center shrink-0"
          >
            <Send size={15} />
          </button>
        </form>

        {activeFileName && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <FileCode size={11} className="text-emerald-400" />
            <span>Context: <span className="text-slate-300">{activeFileName}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
