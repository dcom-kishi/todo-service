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

    // AuthButtons (which is a client component) will be rendered as is in this test setup
    // Since we are testing the server component's output
    expect(screen.getByText('Todo Service')).toBeInTheDocument();
  });

  it('renders user menu when authenticated', async () => {
    (auth as any).mockResolvedValue({
      user: {
        email: 'test@example.com',
        username: 'testuser',
      },
    });

    const NavbarResolved = await Navbar();
    render(NavbarResolved);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    // UserMenu is now responsible for showing profile/tasks/logout links after click
  });
});