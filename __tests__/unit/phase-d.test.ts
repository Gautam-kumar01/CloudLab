import { describe, it, expect } from 'vitest';
import { getTemplate, normalizeTemplateId, builtInTemplates } from '@/lib/templates';
import { CreateProjectSchema } from '@/lib/validations/api';

describe('Phase D: Template Enum Alignment and Project Validation', () => {
  it('normalizes legacy and short template names to canonical templates', () => {
    expect(normalizeTemplateId('node')).toBe('nodejs');
    expect(normalizeTemplateId('nodejs')).toBe('nodejs');
    expect(normalizeTemplateId('react')).toBe('react-vite');
    expect(normalizeTemplateId('react-vite')).toBe('react-vite');
    expect(normalizeTemplateId('next')).toBe('next');
    expect(normalizeTemplateId('nextjs')).toBe('next');
    expect(normalizeTemplateId('golang')).toBe('go');
    expect(normalizeTemplateId('c++')).toBe('cpp');
  });

  it('getTemplate correctly resolves node and react-vite files', () => {
    const nodeTpl = getTemplate('node');
    expect(nodeTpl.id).toBe('nodejs');
    expect(nodeTpl.files['package.json']).toBeDefined();
    expect(nodeTpl.files['index.js']).toBeDefined();

    const reactTpl = getTemplate('react');
    expect(reactTpl.id).toBe('react-vite');
    expect(reactTpl.files['vite.config.ts']).toBeDefined();

    const nextTpl = getTemplate('next');
    expect(nextTpl.id).toBe('next');
    expect(nextTpl.files['app/page.tsx']).toBeDefined();

    const fallbackTpl = getTemplate('nonexistent-id');
    expect(fallbackTpl.id).toBe('blank');
  });

  it('CreateProjectSchema validates both canonical and alias template names', () => {
    const templatesToTest = [
      'node',
      'nodejs',
      'react',
      'react-vite',
      'next',
      'nextjs',
      'python',
      'java',
      'cpp',
      'go',
      'golang',
      'blank',
    ];

    for (const tpl of templatesToTest) {
      const parsed = CreateProjectSchema.safeParse({
        name: `Test-${tpl}`,
        template: tpl,
      });
      expect(parsed.success, `Template "${tpl}" should pass schema validation`).toBe(true);
    }
  });

  it('CreateProjectSchema rejects invalid templates and invalid names', () => {
    const invalidTemplate = CreateProjectSchema.safeParse({
      name: 'Valid Project',
      template: 'ruby-on-rails-invalid',
    });
    expect(invalidTemplate.success).toBe(false);

    const emptyName = CreateProjectSchema.safeParse({
      name: '',
      template: 'nodejs',
    });
    expect(emptyName.success).toBe(false);
  });
});
