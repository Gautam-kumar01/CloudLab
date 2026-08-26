import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { logAgentAction } from '@/lib/agent-logger';

// In-memory rate limiting map for the AI endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 30; // Max 30 requests per IP
const WINDOW_MS = 60 * 1000; // Per 1 minute

const execPromise = util.promisify(exec);
export const maxDuration = 30;

// Security: Prevent path traversal
function getSafePath(relativePath: string, workspaceId?: string) {
  const workspaceRoot = workspaceId
    ? path.join(process.cwd(), 'workspaces', workspaceId)
    : process.cwd();
  const absolutePath = path.resolve(workspaceRoot, relativePath);

  if (!absolutePath.startsWith(workspaceRoot)) {
    throw new Error('Path traversal detected. Access denied.');
  }
  return absolutePath;
}

export async function POST(req: Request) {
  try {
    // Rate Limiting Logic
    const ip = req.headers.get('x-forwarded-for') || 'anonymous_ip';
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + WINDOW_MS };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + WINDOW_MS;
    }

    if (record.count >= MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute before trying again.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    record.count += 1;
    rateLimitMap.set(ip, record);

    const { messages, workspaceId } = await req.json();

    const modelsToTry = [];
    if (process.env.GROQ_API_KEY) {
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
      });
      modelsToTry.push({ provider: 'Groq Qwen 3.6 27B', model: groq('qwen/qwen3.6-27b') });
      modelsToTry.push({ provider: 'Groq GPT-OSS 20B', model: groq('openai/gpt-oss-20b') });
    }
    if (process.env.OPENROUTER_API_KEY) {
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      modelsToTry.push({
        provider: 'OpenRouter Liquid LFM 2.5 (Free)',
        model: openrouter('liquid/lfm-2.5-2.6b:free'),
      });
      modelsToTry.push({
        provider: 'OpenRouter Nemotron 3.5 (Free)',
        model: openrouter('nvidia/nemotron-3.5-lightning:free'),
      });
    }
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
      modelsToTry.push({
        provider: 'Google Gemini Flash Latest',
        model: google('gemini-flash-latest'),
      });
      modelsToTry.push({ provider: 'Google Gemini 2.5 Flash', model: google('gemini-2.5-flash') });
    }
    if (process.env.OPENAI_API_KEY) {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      modelsToTry.push({ provider: 'OpenAI GPT-4o-mini', model: openai('gpt-4o-mini') });
    }

    if (modelsToTry.length === 0) {
      throw new Error('No API keys found for Groq, OpenRouter, Google, or OpenAI.');
    }

    // Intercept incoming human approvals before passing to AI
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'tool' && Array.isArray(lastMessage.content)) {
      for (const content of lastMessage.content) {
        if (content.type === 'tool-result' && content.result === 'APPROVED') {
          try {
            if (content.toolName === 'writeFile') {
              const safePath = getSafePath(content.args.path, workspaceId);
              await fs.writeFile(safePath, content.args.content, 'utf8');
              content.result = `Successfully wrote to ${content.args.path}`;
              logAgentAction('writeFile', { path: content.args.path, status: 'success' });
            } else if (content.toolName === 'runCommand') {
              if (process.env.AGENT_DEV_LOCAL_EXECUTION !== 'true') {
                throw new Error(
                  'Local execution is disabled. Production Docker execution not yet implemented.',
                );
              }
              const workspaceRoot = workspaceId
                ? path.join(process.cwd(), 'workspaces', workspaceId)
                : process.cwd();
              const { stdout, stderr } = await execPromise(content.args.command, {
                cwd: workspaceRoot,
                timeout: 15000,
              });
              content.result = `Exit Code 0\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`;
              logAgentAction('runCommand', {
                command: content.args.command,
                status: 'success',
                stdout,
                stderr,
              });
            }
          } catch (err: any) {
            content.result = `Error executing tool: ${err.message}`;
            logAgentAction(content.toolName, {
              args: content.args,
              status: 'error',
              error: err.message,
            });
          }
        }
      }
    }

    const errorLogs: string[] = [];
    for (const { provider, model } of modelsToTry) {
      try {
        const result = await streamText({
          model,
          system: `You are an expert AI coding assistant built into the CloudLab IDE. You have access to tools to inspect the workspace, modify files, and run commands. 
IMPORTANT RULES:
1. You MUST use the provided tool functions natively. DO NOT output raw text tags like <function=readFile>. Just call the tool directly.
2. For tools that require human approval (like writeFile and runCommand), the system will automatically pause and ask the user via a UI popup. You do NOT need to ask the user to type 'approve'. Just call the tool, and the system handles the rest.
3. If you need to explore the workspace, use listDirectory first before guessing file paths.
4. DO NOT read more than 1 or 2 files at once. Reading too many files simultaneously will crash the system due to token limits. If the user asks you to read all files, politely decline and ask them which specific file to start with.`,
          messages,
          tools: {
            listDirectory: tool({
              description: 'List all files and folders in a directory within the workspace.',
              parameters: z.object({
                path: z.string().describe('The relative path to the directory (use "." for root)'),
              }),
              execute: async ({ path: dirPath }) => {
                try {
                  const safePath = getSafePath(dirPath, workspaceId);
                  const items = await fs.readdir(safePath, { withFileTypes: true });
                  return items
                    .map((item) => `${item.isDirectory() ? '[DIR]' : '[FILE]'} ${item.name}`)
                    .join('\n');
                } catch (err: any) {
                  return `Error listing directory: ${err.message}`;
                }
              },
            }),
            readFile: tool({
              description: 'Read the contents of a file in the workspace.',
              parameters: z.object({
                path: z.string().describe('The relative path to the file (e.g. src/app/page.tsx)'),
              }),
              execute: async ({ path: filePath }) => {
                try {
                  const safePath = getSafePath(filePath, workspaceId);
                  const content = await fs.readFile(safePath, 'utf8');
                  logAgentAction('readFile', { path: filePath });
                  return content;
                } catch (err: any) {
                  return `Error reading file: ${err.message}`;
                }
              },
            }),
            writeFile: tool({
              description: 'Create or overwrite a file in the workspace. REQUIRES HUMAN APPROVAL.',
              parameters: z.object({
                path: z.string().describe('The relative path to the file'),
                content: z.string().describe('The complete file content to write'),
              }),
              // No execute function -> pauses stream and returns to client for approval
            }),
            runCommand: tool({
              description:
                'Run a shell command in the workspace terminal. REQUIRES HUMAN APPROVAL.',
              parameters: z.object({
                command: z.string().describe('The command to execute (e.g., npm install)'),
              }),
              // No execute function -> pauses stream and returns to client for approval
            }),
          },
          maxSteps: 5, // Allow multi-step tool workflows automatically
        });

        return result.toDataStreamResponse();
      } catch (err: any) {
        console.warn(`[${provider}] failed. Error: ${err.message}`);
        errorLogs.push(`[${provider}]: ${err.message}`);
        continue;
      }
    }

    // If we exhausted all models
    throw new Error(
      `All configured AI models failed to respond.\n\nDetails:\n${errorLogs.join('\n')}`,
    );
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
