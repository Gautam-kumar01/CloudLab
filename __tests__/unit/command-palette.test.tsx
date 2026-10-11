import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CommandPaletteModal, { type CommandItem } from '@/app/workspace/CommandPaletteModal';

const commands: CommandItem[] = [
  { id: 'new-file', label: 'File: New File', icon: '📄' },
  { id: 'search-workspace', label: 'View: Search Workspace', icon: '🔎' },
  { id: 'open-preview', label: 'Preview: Open Live Preview', icon: '🌐' },
];
const fileTree = {
  src: {
    type: 'directory',
    name: 'src',
    path: 'src',
    children: {
      'page.tsx': { type: 'file', name: 'page.tsx', path: 'src/page.tsx' },
      'layout.tsx': { type: 'file', name: 'layout.tsx', path: 'src/layout.tsx' },
    },
  },
};

function PaletteHarness({
  onClose = vi.fn(),
  onExecuteCommand = vi.fn(),
  onOpenFile = vi.fn(),
}: {
  onClose?: () => void;
  onExecuteCommand?: (id: string) => void;
  onOpenFile?: (path: string) => void;
}) {
  const [mode, setMode] = useState<'commands' | 'files'>('commands');
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <CommandPaletteModal
      isOpen
      onClose={onClose}
      mode={mode}
      setMode={setMode}
      query={query}
      setQuery={setQuery}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      commands={commands}
      fileTree={fileTree}
      onExecuteCommand={onExecuteCommand}
      onOpenFile={onOpenFile}
    />
  );
}

describe('CommandPaletteModal', () => {
  it('supports arrow-key selection and Enter to execute a safe command', () => {
    const execute = vi.fn();
    render(<PaletteHarness onExecuteCommand={execute} />);

    const input = screen.getByRole('combobox', { name: 'Search commands' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /View: Search Workspace/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(execute).toHaveBeenCalledWith('search-workspace');
  });

  it('switches to file search and opens the selected file with Enter', () => {
    const openFile = vi.fn();
    const close = vi.fn();
    render(<PaletteHarness onOpenFile={openFile} onClose={close} />);

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Files' }));
    const input = screen.getByRole('combobox', { name: 'Search files' });
    fireEvent.change(input, { target: { value: 'page.tsx' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(openFile).toHaveBeenCalledWith('src/page.tsx');
    expect(close).toHaveBeenCalledOnce();
  });

  it('filters commands and closes with Escape', () => {
    const close = vi.fn();
    render(<PaletteHarness onClose={close} />);
    const input = screen.getByRole('combobox', { name: 'Search commands' });
    fireEvent.change(input, { target: { value: 'preview' } });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Open Live Preview/ })).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'no-matching-command' } });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('No matching commands.')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });

  it('closes with Escape after focus moves to an option and traps forward Tab', () => {
    const close = vi.fn();
    render(<PaletteHarness onClose={close} />);
    const option = screen.getByRole('option', { name: /File: New File/ });
    act(() => option.focus());
    expect(option).toHaveFocus();
    fireEvent.keyDown(option, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();

    const lastOption = screen.getByRole('option', { name: /Open Live Preview/ });
    act(() => lastOption.focus());
    fireEvent.keyDown(lastOption, { key: 'Tab' });
    expect(screen.getByRole('combobox', { name: 'Search commands' })).toHaveFocus();
  });
});
