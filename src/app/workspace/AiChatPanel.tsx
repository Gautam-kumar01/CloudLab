'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import {
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
  Zap,
  CornerDownLeft,
  X,
  FileText,
  Lightbulb,
  CheckCircle2,
  Bug,
  TestTube,
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
  const [includeContext, setIncludeContext] = useState(true);

  const { messages, isLoading, stop, setMessages, append, addToolResult } = useChat({
    api: '/api/chat',
    body: {
      workspaceId,
      activeFile: includeContext ? activeFile : undefined,
      fileContent: includeContext ? fileContent : undefined,
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSendMessage = () => {
    if (!(input || '').trim() || isLoading) return;

    let finalPrompt = input.trim();
    if (includeContext && activeFile && fileContent && !messages.length) {
      finalPrompt = `[Context: Active file is ${activeFile}]\n\n${finalPrompt}`;
    }

    append({ role: 'user', content: finalPrompt });
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    <div className="flex flex-col h-full bg-[#070b14] text-slate-100 border-l border-white/[0.08] select-text cloudlab-panel">
      {/* Header Bar */}
      <div className="px-4 py-3.5 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm shadow-emerald-500/10">
            <Bot size={17} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide">CloudLab Copilot</span>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-[11.5px] text-slate-400 mt-0.5 whitespace-normal leading-normal">
              AI Pair Programmer & Assistant
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            title="Clear Chat History"
            onClick={() => {
              if (confirm('Clear entire chat conversation?')) setMessages([]);
            }}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && (
          <div className="space-y-4 pt-1">
            {/* Welcome Banner Card */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#0f1d38] via-[#0d1629] to-[#090e1b] p-4 rounded-2xl border border-emerald-500/20 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <Sparkles size={13} />
                </div>
                <span className="text-emerald-300">Your AI Pair Programmer</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-normal break-words">
                Ask code questions, generate components, explain logic, diagnose errors, or run terminal tasks with AI.
              </p>
              {activeFileName && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs flex-wrap">
                  <FileCode size={13} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-400 text-xs">Active File:</span>
                  <span className="font-bold text-emerald-300 cloudlab-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 break-all whitespace-normal">
                    {activeFileName}
                  </span>
                </div>
              )}
            </div>

            {/* Suggested Actions Grid */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-400" />
                <span>Quick Actions</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {activeFileName && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Please explain the architecture, functions, and key logic of ${activeFileName}`)}
                      className="w-full text-left p-3.5 rounded-2xl bg-[#0c1426] hover:bg-[#121f3a] border border-white/[0.08] hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all group cursor-pointer flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <Code2 size={14} />
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors whitespace-normal break-words">
                            Explain {activeFileName}
                          </span>
                        </div>
                        <span className="text-[10.5px] px-2 py-0.5 rounded bg-white/5 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-300 cloudlab-mono shrink-0 font-medium">
                          Run
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-relaxed whitespace-normal break-words pl-0.5">
                        Break down architecture, functions, and core logic.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Inspect ${activeFileName} and find any potential bugs, edge cases, memory leaks, or syntax errors.`)}
                      className="w-full text-left p-3.5 rounded-2xl bg-[#0c1426] hover:bg-[#121f3a] border border-white/[0.08] hover:border-teal-500/40 text-slate-200 hover:text-white transition-all group cursor-pointer flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-500 group-hover:text-black transition-all">
                            <Bug size={14} />
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors whitespace-normal break-words">
                            Find Bugs & Optimize
                          </span>
                        </div>
                        <span className="text-[10.5px] px-2 py-0.5 rounded bg-white/5 group-hover:bg-teal-500/20 text-slate-400 group-hover:text-teal-300 cloudlab-mono shrink-0 font-medium">
                          Run
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-relaxed whitespace-normal break-words pl-0.5">
                        Detect syntax flaws, edge cases, and performance leaks.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Generate comprehensive unit tests for ${activeFileName} with full edge-case coverage.`)}
                      className="w-full text-left p-3.5 rounded-2xl bg-[#0c1426] hover:bg-[#121f3a] border border-white/[0.08] hover:border-cyan-500/40 text-slate-200 hover:text-white transition-all group cursor-pointer flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                            <TestTube size={14} />
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors whitespace-normal break-words">
                            Generate Unit Tests
                          </span>
                        </div>
                        <span className="text-[10.5px] px-2 py-0.5 rounded bg-white/5 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 cloudlab-mono shrink-0 font-medium">
                          Run
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-relaxed whitespace-normal break-words pl-0.5">
                        Create full test suites with positive and negative test cases.
                      </p>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleQuickPrompt('List all files in the current workspace and provide a structured project summary.')}
                  className="w-full text-left p-3.5 rounded-2xl bg-[#0c1426] hover:bg-[#121f3a] border border-white/[0.08] hover:border-blue-500/40 text-slate-200 hover:text-white transition-all group cursor-pointer flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-black transition-all">
                        <Terminal size={14} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors whitespace-normal break-words">
                        Workspace Summary
                      </span>
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded bg-white/5 group-hover:bg-blue-500/20 text-slate-400 group-hover:text-blue-300 cloudlab-mono shrink-0 font-medium">
                      Run
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-relaxed whitespace-normal break-words pl-0.5">
                    Inspect directory hierarchy and high-level component flow.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((m, mIdx) => (
          <div key={m.id || mIdx} className="space-y-2">
            {/* Author label */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-1">
              {m.role === 'user' ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                    <User size={11} />
                  </div>
                  <span className="text-emerald-400 font-medium">You</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
                    <Bot size={11} />
                  </div>
                  <span className="text-teal-300 font-medium">CloudLab Copilot</span>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`text-[13px] leading-relaxed rounded-2xl p-4 shadow-md ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 text-white rounded-tr-sm ml-4'
                  : 'bg-[#0d1629] border border-white/10 text-slate-200 rounded-tl-sm'
              }`}
            >
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              ) : (
                <div className="space-y-3 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const codeId = `code-${m.id}-${codeString.slice(0, 10)}`;

                        if (match) {
                          return (
                            <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#050811] shadow-xl">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0f1d] border-b border-slate-800 text-xs text-slate-400 font-mono">
                                <span className="font-semibold text-emerald-400">{match[1]}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(codeString, codeId)}
                                  className="flex items-center gap-1.5 hover:text-white transition-colors text-slate-400 py-0.5 px-2 rounded hover:bg-white/5 cursor-pointer"
                                >
                                  {copiedIndex === codeId ? (
                                    <>
                                      <Check size={13} className="text-emerald-400" />
                                      <span className="text-emerald-400 font-sans text-[11px] font-semibold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={13} />
                                      <span className="font-sans text-[11px]">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3 text-[12px] font-mono text-emerald-300 overflow-x-auto leading-relaxed m-0 bg-transparent">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        }

                        return (
                          <code
                            className="bg-slate-950/90 text-emerald-300 px-1.5 py-0.5 rounded-md border border-slate-800 text-[12px] font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-2.5 last:mb-0 leading-relaxed text-[13px]">{children}</p>;
                      },
                      h1({ children }) {
                        return <h1 className="text-base font-bold text-white mb-2 mt-3">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-sm font-bold text-white mb-2 mt-2.5">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-xs font-bold text-emerald-400 mb-1.5 mt-2">{children}</h3>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-4 space-y-1.5 mb-2.5">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-4 space-y-1.5 mb-2.5">{children}</ol>;
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
                      className="text-xs text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-2 max-w-full truncate shadow-sm"
                    >
                      <Terminal size={13} className="text-cyan-400 shrink-0" />
                      <span>
                        Inspected:{' '}
                        <code className="text-emerald-300 font-mono font-semibold">{toolInvocation.args.path}</code>
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
                      className="bg-[#0f172a] border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-xl"
                    >
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <AlertTriangle size={15} />
                        <span>Action Approval Required:</span>
                      </div>

                      <div className="bg-[#050811] rounded-xl p-3 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                        {isWriting ? (
                          <>
                            <div className="text-emerald-400 font-bold mb-1.5">
                              File: {toolInvocation.args.path}
                            </div>
                            <pre className="text-slate-300 m-0 max-h-36 overflow-y-auto leading-relaxed">
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
                          className={`text-xs font-mono px-3 py-1.5 rounded-xl ${
                            String(toolInvocation.result).includes('Rejected')
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          Status: {String(toolInvocation.result).substring(0, 100)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              addToolResult({
                                toolCallId,
                                result: 'User rejected the request.',
                              })
                            }
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
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
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
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

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-center justify-between bg-[#0d1629] border border-white/10 px-4 py-2.5 rounded-2xl text-xs text-slate-300 shadow-md">
            <div className="flex items-center gap-2.5">
              <Sparkles size={15} className="text-emerald-400 animate-spin" />
              <span className="text-slate-200 font-medium">CloudLab Copilot is generating...</span>
            </div>
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 transition-colors cursor-pointer"
            >
              <StopCircle size={13} />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* High-Contrast Luxury Input Box Footer */}
      <div className="p-4 bg-[#080d1a]/95 backdrop-blur-md border-t border-white/[0.08] shadow-2xl shrink-0">
        <div className="bg-[#0e162a] border border-slate-700/80 focus-within:border-emerald-400/80 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl p-3.5 transition-all shadow-xl flex flex-col gap-2.5">
          {/* Active Context Chip */}
          {activeFileName && includeContext && (
            <div className="flex items-center justify-between bg-slate-950/90 border border-emerald-500/25 px-3 py-1.5 rounded-xl text-xs text-slate-300 gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileCode size={13} className="text-emerald-400 shrink-0" />
                <span className="text-slate-400 text-xs shrink-0">Context:</span>
                <span className="text-emerald-300 font-bold cloudlab-mono text-xs break-all whitespace-normal">{activeFileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeContext(false)}
                title="Remove file context"
                className="hover:text-rose-400 text-slate-400 transition-colors p-1 rounded hover:bg-white/5 cursor-pointer shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              activeFileName && includeContext
                ? `Ask about ${activeFileName}...`
                : 'Ask CloudLab Copilot anything...'
            }
            disabled={isLoading}
            className="w-full bg-transparent px-1 py-1 text-xs text-white placeholder-slate-400 outline-none resize-none scrollbar-thin scrollbar-thumb-slate-800 disabled:opacity-50 leading-relaxed cloudlab-panel"
          />

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 min-w-0">
              <CornerDownLeft size={12} className="shrink-0 text-slate-500" />
              <span>Enter ↵ to send</span>
            </span>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !(input || '').trim()}
              className="btn-cta-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shrink-0"
            >
              <span>Send</span>
              <Send size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
