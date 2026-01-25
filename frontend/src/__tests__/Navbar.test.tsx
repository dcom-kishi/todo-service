import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { describe, it, expect, vi } from 'vitest';

// auth をモック
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// logoutAction をモック
vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

import { auth } from '@/auth';

describe('Navbar', () => {
  it('renders login and signup links when not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const NavbarResolved = await Navbar();
    render(NavbarResolved);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('renders username and logout button when authenticated', async () => {
    (auth as any).mockResolvedValue({
      user: {
        email: 'test@example.com',
        username: 'testuser',
      },
    });

    const NavbarResolved = await Navbar();
    render(NavbarResolved);

    expect(screen.getByText('Hi,')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
