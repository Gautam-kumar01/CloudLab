import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { apiResponse, apiError } from '@/lib/api-utils';
import { workspacePath, workspaceFilePath } from '@/lib/workspace-paths';
import { promises as fs } from 'fs';
import path from 'path';

// File extensions and directory names to skip during text search
const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'build',
  '.turbo',
  '__pycache__',
  '.vscode',
  '.idea',
  '.cache',
]);

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.mp3',
  '.wav',
  '.exe',
  '.bin',
  '.wasm',
  '.dll',
  '.so',
  '.dylib',
  '.lock',
]);

const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB limit per searchable file
const MAX_TOTAL_MATCHES = 1000;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchRegex(query: string, matchCase: boolean, matchWholeWord: boolean, isRegex: boolean): RegExp {
  let pattern = query;
  if (!isRegex) {
    pattern = escapeRegExp(pattern);
  }
  if (matchWholeWord) {
    pattern = `\\b${pattern}\\b`;
  }
  return new RegExp(pattern, matchCase ? 'g' : 'gi');
}

function matchesIncludeExclude(relPath: string, includePattern?: string, excludePattern?: string): boolean {
  if (includePattern && includePattern.trim()) {
    const patterns = includePattern.split(',').map((p) => p.trim().toLowerCase());
    const matched = patterns.some((p) => {
      if (p.startsWith('*.')) {
        return relPath.toLowerCase().endsWith(p.slice(1));
      }
      return relPath.toLowerCase().includes(p);
    });
    if (!matched) return false;
  }

  if (excludePattern && excludePattern.trim()) {
    const patterns = excludePattern.split(',').map((p) => p.trim().toLowerCase());
    const matched = patterns.some((p) => {
      if (p.startsWith('*.')) {
        return relPath.toLowerCase().endsWith(p.slice(1));
      }
      return relPath.toLowerCase().includes(p);
    });
    if (matched) return false;
  }

  return true;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');
    const query = searchParams.get('q') || '';
    const matchCase = searchParams.get('caseSensitive') === 'true';
    const matchWholeWord = searchParams.get('wholeWord') === 'true';
    const isRegex = searchParams.get('regex') === 'true';
    const includePattern = searchParams.get('include') || '';
    const excludePattern = searchParams.get('exclude') || '';

    if (!workspaceId) {
      return apiError('Missing workspace id', 400);
    }

    if (!query.trim()) {
      return apiResponse({ files: [], totalMatches: 0, totalFiles: 0 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }
    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    let searchRegex: RegExp;
    try {
      searchRegex = buildSearchRegex(query, matchCase, matchWholeWord, isRegex);
    } catch (regexErr: any) {
      return apiError(`Invalid regular expression: ${regexErr.message}`, 400);
    }

    const workspaceRoot = workspacePath(workspaceId);
    const results: Array<{
      filePath: string;
      matches: Array<{
        line: number;
        column: number;
        length: number;
        lineText: string;
      }>;
    }> = [];

    let totalMatchCount = 0;

    async function searchDirectory(dir: string, relDir: string = '') {
      if (totalMatchCount >= MAX_TOTAL_MATCHES) return;

      let entries;
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (totalMatchCount >= MAX_TOTAL_MATCHES) break;

        const fullPath = path.join(dir, entry.name);
        const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name)) {
            await searchDirectory(fullPath, relPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (BINARY_EXTENSIONS.has(ext)) continue;
          if (!matchesIncludeExclude(relPath, includePattern, excludePattern)) continue;

          try {
            const stat = await fs.stat(fullPath);
            if (stat.size > MAX_FILE_SIZE) continue;

            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            const fileMatches: Array<{
              line: number;
              column: number;
              length: number;
              lineText: string;
            }> = [];

            for (let i = 0; i < lines.length; i++) {
              if (totalMatchCount >= MAX_TOTAL_MATCHES) break;
              const line = lines[i];

              // Reset regex lastIndex for global searches
              searchRegex.lastIndex = 0;
              let match: RegExpExecArray | null;

              while ((match = searchRegex.exec(line)) !== null) {
                fileMatches.push({
                  line: i + 1,
                  column: match.index + 1,
                  length: match[0].length,
                  lineText: line.slice(0, 300), // Cap long lines
                });
                totalMatchCount++;

                if (totalMatchCount >= MAX_TOTAL_MATCHES) break;
                if (!searchRegex.global) break;
                // Guard against 0-length infinite loops
                if (match.index === searchRegex.lastIndex) {
                  searchRegex.lastIndex++;
                }
              }
            }

            if (fileMatches.length > 0) {
              results.push({
                filePath: relPath,
                matches: fileMatches,
              });
            }
          } catch {
            // Ignore unreadable files (binary, locked, etc.)
          }
        }
      }
    }

    await searchDirectory(workspaceRoot);

    return apiResponse({
      files: results,
      totalMatches: totalMatchCount,
      totalFiles: results.length,
      capped: totalMatchCount >= MAX_TOTAL_MATCHES,
    });
  } catch (err: any) {
    console.error('Workspace search error:', err);
    return apiError('Search failed', 500, err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      query,
      replace = '',
      matchCase = false,
      matchWholeWord = false,
      isRegex = false,
      replaceMode = 'all', // 'all' | 'file'
      targetFile,
    } = body;

    if (!workspaceId || !query) {
      return apiError('Workspace ID and query are required', 400);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }
    const hasAccess = await canEditWorkspace(session.user.id, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    let searchRegex: RegExp;
    try {
      searchRegex = buildSearchRegex(query, matchCase, matchWholeWord, isRegex);
    } catch (regexErr: any) {
      return apiError(`Invalid regex: ${regexErr.message}`, 400);
    }

    const modifiedFiles: string[] = [];
    let replacedCount = 0;

    if (replaceMode === 'file' && targetFile) {
      const fullPath = workspaceFilePath(workspaceId, targetFile);
      const content = await fs.readFile(fullPath, 'utf-8');
      const matches = content.match(searchRegex);
      if (matches) {
        replacedCount += matches.length;
        const newContent = content.replace(searchRegex, replace);
        await fs.writeFile(fullPath, newContent, 'utf-8');
        modifiedFiles.push(targetFile);
      }
    } else {
      // Replace across all workspace files
      const workspaceRoot = workspacePath(workspaceId);

      async function replaceInDir(dir: string, relDir: string = '') {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) {
              await replaceInDir(fullPath, relPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (BINARY_EXTENSIONS.has(ext)) continue;

            try {
              const stat = await fs.stat(fullPath);
              if (stat.size > MAX_FILE_SIZE) continue;

              const content = await fs.readFile(fullPath, 'utf-8');
              searchRegex.lastIndex = 0;
              const matches = content.match(searchRegex);
              if (matches && matches.length > 0) {
                replacedCount += matches.length;
                const newContent = content.replace(searchRegex, replace);
                await fs.writeFile(fullPath, newContent, 'utf-8');
                modifiedFiles.push(relPath);
              }
            } catch {}
          }
        }
      }

      await replaceInDir(workspaceRoot);
    }

    return apiResponse({
      success: true,
      replacedCount,
      modifiedFiles,
    });
  } catch (err: any) {
    console.error('Workspace replace error:', err);
    return apiError('Replace operation failed', 500, err.message);
  }
}
