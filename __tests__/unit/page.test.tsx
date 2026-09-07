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

  it('contains the call to action button linking to sign up', () => {
    render(<LandingPage />);
    const buttons = screen.getAllByText(/(Start Coding|Get Started)/i);
    expect(buttons.length).toBeGreaterThan(0);
    const signUpLink = buttons[0].closest('a');
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });
});
