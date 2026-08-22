import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '@/app/page';

// Mock Next.js Link component to avoid router issues
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />);
    const headings = screen.getAllByText(/CloudLab/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('contains the Get Started button', () => {
    render(<LandingPage />);
    const button = screen.getByText(/Get Started/i);
    expect(button).toBeInTheDocument();
    expect(button.closest('a')).toHaveAttribute('href', '/sign-up');
  });
});
