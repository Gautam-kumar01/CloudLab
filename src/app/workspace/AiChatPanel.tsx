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
    <div className="flex flex-col h-full bg-[#080d1a] text-slate-100 border-l border-white/[0.08] select-text">
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-[#0c1324]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Sparkles size={13} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
              CloudLab AI
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/80" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-none">Copilot Assistant</div>
          </div>
        </div>

        <button
          type="button"
          title="Clear Chat History"
          onClick={() => {
            if (confirm('Clear chat history?')) setMessages([]);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && (
          <div className="space-y-3 pt-1">
            {/* Welcome Card */}
            <div className="bg-gradient-to-b from-[#111c35]/90 to-[#0c1426]/90 p-3.5 rounded-xl border border-emerald-500/25 shadow-lg shadow-black/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[12px]">
                <Bot size={15} />
                <span>Welcome to CloudLab AI</span>
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed">
                I can explain code, generate boilerplate, fix bugs, or execute terminal commands in your workspace.
              </p>
              {activeFileName && (
                <div className="pt-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] bg-slate-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-md text-emerald-300 font-mono">
                    <FileCode size={12} className="text-emerald-400" />
                    <span className="text-slate-400">Active:</span>
                    <span className="font-semibold text-emerald-300">{activeFileName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Actions */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-1 flex items-center gap-1">
                <Zap size={10} className="text-amber-400" /> Suggested Actions
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {activeFileName && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Please explain the architecture and key logic of ${activeFileName}`)}
                      className="text-left text-[11.5px] bg-[#0d1527] hover:bg-[#131f38] border border-white/[0.06] hover:border-emerald-500/40 p-2.5 rounded-lg text-slate-300 hover:text-emerald-200 transition-all flex items-center gap-2.5 group shadow-sm"
                    >
                      <Code2 size={13} className="text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">Explain <strong>{activeFileName}</strong></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(`Inspect ${activeFileName} and find any potential bugs, memory leaks, or syntax errors.`)}
                      className="text-left text-[11.5px] bg-[#0d1527] hover:bg-[#131f38] border border-white/[0.06] hover:border-emerald-500/40 p-2.5 rounded-lg text-slate-300 hover:text-emerald-200 transition-all flex items-center gap-2.5 group shadow-sm"
                    >
                      <Sparkles size={13} className="text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">Find bugs & optimizations</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('List all files in the current workspace and explain the project structure.')}
                  className="text-left text-[11.5px] bg-[#0d1527] hover:bg-[#131f38] border border-white/[0.06] hover:border-emerald-500/40 p-2.5 rounded-lg text-slate-300 hover:text-emerald-200 transition-all flex items-center gap-2.5 group shadow-sm"
                >
                  <Terminal size={13} className="text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Explore workspace directory</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((m, mIdx) => (
          <div key={m.id || mIdx} className="space-y-1.5">
            {/* Author label */}
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 px-0.5">
              {m.role === 'user' ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <User size={9} />
                  </div>
                  <span className="text-emerald-400">You</span>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                    <Bot size={9} />
                  </div>
                  <span className="text-teal-300">CloudLab AI</span>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`text-[12px] leading-relaxed rounded-xl p-3 ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 text-slate-100 rounded-tr-sm shadow-sm'
                  : 'bg-[#0d1629] border border-white/[0.07] text-slate-200 rounded-tl-sm shadow-md'
              }`}
            >
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap">{m.content}</div>
              ) : (
                <div className="prose prose-invert prose-xs max-w-none space-y-2 text-[12px]">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const codeId = `code-${m.id}-${codeString.slice(0, 10)}`;

                        if (match) {
                          return (
                            <div className="my-2 rounded-lg overflow-hidden border border-slate-700/80 bg-[#050811] shadow-inner">
                              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-950/90 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
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
                              <pre className="p-2.5 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-normal m-0 bg-transparent">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        }

                        return (
                          <code
                            className="bg-slate-950/80 text-emerald-300 px-1 py-0.5 rounded border border-slate-800 text-[11px] font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-3.5 space-y-1 mb-1.5">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-3.5 space-y-1 mb-1.5">{children}</ol>;
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
                      className="text-[10.5px] text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800 inline-flex items-center gap-1.5 max-w-full truncate"
                    >
                      <Terminal size={11} className="text-cyan-400 shrink-0" />
                      <span>
                        Inspected:{' '}
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
                      className="bg-[#0f172a] border border-amber-500/40 rounded-xl p-3 space-y-2 shadow-lg shadow-black/50"
                    >
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11.5px]">
                        <AlertTriangle size={14} />
                        <span>Action Approval Required:</span>
                      </div>

                      <div className="bg-[#050811] rounded-lg p-2 border border-slate-800 text-[10.5px] font-mono text-slate-300 overflow-x-auto">
                        {isWriting ? (
                          <>
                            <div className="text-emerald-400 font-bold mb-1">
                              File: {toolInvocation.args.path}
                            </div>
                            <pre className="text-slate-300 m-0 max-h-32 overflow-y-auto">
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
                          className={`text-[10.5px] font-mono px-2 py-0.5 rounded ${
                            String(toolInvocation.result).includes('Rejected')
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          Status: {String(toolInvocation.result).substring(0, 100)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              addToolResult({
                                toolCallId,
                                result: 'User rejected the request.',
                              })
                            }
                            className="flex-1 py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
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
                            className="flex-1 py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-between bg-[#0d1629] border border-white/[0.08] px-3 py-2 rounded-xl text-[11.5px] text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-emerald-400 animate-spin" />
              <span className="text-slate-300 font-medium">CloudLab AI is thinking...</span>
            </div>
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition-colors"
            >
              <StopCircle size={11} />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="p-2.5 bg-[#0a0f1d]/95 backdrop-blur-md border-t border-white/[0.08] shadow-2xl shrink-0">
        <div className="bg-[#0e1628] border border-slate-700/70 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-xl p-2 transition-all shadow-inner flex flex-col gap-1.5">
          {/* Active Context Chip */}
          {activeFileName && includeContext && (
            <div className="flex items-center justify-between bg-slate-950/70 border border-white/[0.06] px-2 py-0.5 rounded-md text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1 truncate">
                <FileCode size={11} className="text-emerald-400 shrink-0" />
                <span className="text-slate-400">Context:</span>
                <span className="text-emerald-300 font-semibold truncate">{activeFileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeContext(false)}
                title="Remove file context"
                className="hover:text-rose-400 text-slate-400 transition-colors p-0.5"
              >
                <X size={11} />
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
                ? `Ask about ${activeFileName}... (Enter to send)`
                : 'Ask CloudLab AI anything... (Enter to send)'
            }
            disabled={isLoading}
            className="w-full bg-transparent px-1.5 py-1 text-[12px] text-slate-100 placeholder-slate-400/80 outline-none resize-none scrollbar-thin scrollbar-thumb-slate-800 disabled:opacity-50 leading-relaxed font-sans"
          />

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <div className="text-[9.5px] text-slate-400 font-mono flex items-center gap-1">
              <CornerDownLeft size={10} className="text-slate-400" />
              <span>Enter to send · Shift+Enter for new line</span>
            </div>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !(input || '').trim()}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-1 text-[11px] shrink-0"
            >
              <span>Send</span>
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
