import { describe, it, expect } from 'vitest';
import { UploadFolderSchema } from '@/lib/validations/api';

describe('Phase C: Upload Bounding and Deploy Validation', () => {
  it('UploadFolderSchema rejects payload with more than 500 files', () => {
    const tooManyFiles = Array.from({ length: 501 }, (_, i) => ({
      path: `file_${i}.txt`,
      content: 'hello',
    }));

    const result = UploadFolderSchema.safeParse({
      folderName: 'overflow-project',
      files: tooManyFiles,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Cannot upload more than 500 files per upload');
    }
  });

  it('UploadFolderSchema accepts valid bounded payload', () => {
    const validFiles = [
      { path: 'index.js', content: 'console.log("hi");' },
      { path: 'package.json', content: '{"name":"test"}' },
    ];

    const result = UploadFolderSchema.safeParse({
      folderName: 'valid-project',
      files: validFiles,
    });

    expect(result.success).toBe(true);
  });
});
