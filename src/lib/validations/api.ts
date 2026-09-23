import { z } from 'zod';

// --- Project API Schemas ---
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  template: z
    .enum(['node', 'react', 'next', 'python', 'java', 'cpp', 'go', 'blank'])
    .default('blank'),
});

// --- Git API Schemas ---
export const GitPushSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  message: z.string().min(1, 'Commit message is required').default('Update from CloudLab'),
});

export const GitActionSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  action: z.enum([
    'init',
    'stage',
    'unstage',
    'commit',
    'sync',
    'checkout',
    'create-branch',
    'pull',
  ]),
  file: z.string().optional(),
  message: z.string().optional(),
  branch: z.string().optional(),
});

// --- File Operation API Schemas ---
export const FileRenameSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  oldPath: z.string().min(1, 'Old path is required'),
  newPath: z.string().min(1, 'New path is required'),
});

export const FileWriteSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  filename: z.string().min(1, 'Filename is required'),
  content: z.string().optional(),
  isDir: z.boolean().optional(),
});

// --- GitHub Publish Schema ---
export const GithubPublishSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  repoName: z.string().min(1, 'Repository name is required').max(100),
  description: z.string().max(350).optional(),
  isPrivate: z.boolean().default(false),
  githubToken: z.string().optional(),
});

// --- Upload Folder Schema ---
export const UploadFolderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required').max(100),
  files: z.array(
    z.object({
      path: z.string().min(1),
      content: z.string(),
      isBinary: z.boolean().optional(),
    })
  ).min(1, 'At least one file is required'),
});

// --- Docker Deploy Schema ---
export const DockerDeploySchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  action: z.enum(['build', 'start', 'stop', 'restart', 'status', 'logs', 'detect-stack']).default('start'),
  port: z.number().int().min(1).max(65535).optional(),
  customDockerfile: z.string().optional(),
});
