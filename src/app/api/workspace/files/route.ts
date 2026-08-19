import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to determine language for Monaco editor
function getLanguageFromFilename(filename: string) {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.md')) return 'markdown';
  return 'plaintext';
}

const initialFiles = {
  'index.ts': "console.log('Hello from CloudLab Local!');\n\n// Try running 'node index.ts' in the terminal below!",
  'App.tsx': "import React from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello CloudLab 🚀</h1>\n    </div>\n  );\n}",
  'styles.css': "body {\n  margin: 0;\n  padding: 0;\n  background: #0d1117;\n  color: #c9d1d9;\n  font-family: sans-serif;\n}",
  'package.json': "{\n  \"name\": \"cloudlab-demo\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^18.2.0\"\n  }\n}"
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');

  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspace id' }, { status: 400 });
  }

  const workspacePath = path.join(process.cwd(), 'workspaces', workspaceId);

  try {
    // Check if workspace exists, if not, create it and populate with initial files
    try {
      await fs.access(workspacePath);
    } catch {
      await fs.mkdir(workspacePath, { recursive: true });
      for (const [filename, content] of Object.entries(initialFiles)) {
        await fs.writeFile(path.join(workspacePath, filename), content, 'utf-8');
      }
    }

    // If the directory was created by Docker mount, it might be empty
    const rootFiles = await fs.readdir(workspacePath);
    if (rootFiles.length === 0) {
      for (const [filename, content] of Object.entries(initialFiles)) {
        await fs.writeFile(path.join(workspacePath, filename), content, 'utf-8');
      }
    }

    const buildTree = async (dirPath: string, relativePath: string = ''): Promise<any> => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const tree: Record<string, any> = {};
      
      // Sort directories first, then files
      const sortedEntries = entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      for (const entry of sortedEntries) {
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '__pycache__') continue; // Skip large/hidden dirs
        
        const fullPath = path.join(dirPath, entry.name);
        const itemRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          tree[entry.name] = {
            type: 'directory',
            name: entry.name,
            path: itemRelPath,
            children: await buildTree(fullPath, itemRelPath)
          };
        } else {
          tree[entry.name] = {
            type: 'file',
            name: entry.name,
            path: itemRelPath,
            language: getLanguageFromFilename(entry.name),
            content: null // Content is now lazy-loaded
          };
        }
      }
      return tree;
    };

    const result = await buildTree(workspacePath);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error reading workspace files:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { workspaceId, filename, content, isDir } = await request.json();

    if (!workspaceId || !filename) {
      return NextResponse.json({ error: 'Missing workspaceId or filename' }, { status: 400 });
    }

    const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);
    const filePath = path.resolve(workspacePath, filename);

    // Security check to prevent path traversal
    if (!filePath.startsWith(workspacePath)) {
      return NextResponse.json({ error: 'Invalid file path: path traversal detected' }, { status: 403 });
    }
    
    // Ensure workspace exists
    try {
      await fs.access(workspacePath);
    } catch {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    const dirPath = isDir ? filePath : path.dirname(filePath);

    // Create parent directories if needed
    await fs.mkdir(dirPath, { recursive: true });

    if (!isDir) {
      const { checkQuota } = await import('@/lib/storage');
      const contentBuffer = Buffer.from(content || '', 'utf-8');
      
      let existingSize = 0;
      try {
        const stat = await fs.stat(filePath);
        existingSize = stat.size;
      } catch (e) {
        // File doesn't exist yet
      }
      
      const sizeDiff = contentBuffer.byteLength - existingSize;
      if (sizeDiff > 0) {
        const quota = await checkQuota(workspacePath, sizeDiff);
        if (!quota.ok) {
          return NextResponse.json({ error: 'Storage quota exceeded (500 MB limit)' }, { status: 403 });
        }
      }

      await fs.writeFile(filePath, contentBuffer);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving workspace file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('id');
  const filename = searchParams.get('filename');

  if (!workspaceId || !filename) {
    return NextResponse.json({ error: 'Missing workspaceId or filename' }, { status: 400 });
  }

  const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);
  const filePath = path.resolve(workspacePath, filename);

  // Security check to prevent path traversal
  if (!filePath.startsWith(workspacePath)) {
    return NextResponse.json({ error: 'Invalid file path: path traversal detected' }, { status: 403 });
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await fs.rm(filePath, { recursive: true, force: true });
    } else {
      await fs.unlink(filePath);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting workspace file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
