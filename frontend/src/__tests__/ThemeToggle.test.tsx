import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../components/ThemeToggle';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';

// next-themes をモック
const setThemeMock = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: setThemeMock,
  }),
}));

describe('ThemeToggle', () => {
  it('renders correctly and calls setTheme on click', () => {
    render(<ThemeToggle />);
    
    // ThemeToggle has a useEffect to set mounted to true
    // In test environment, this should happen immediately or we might need to wait
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    
    // If theme is 'light', it should call setTheme('dark')
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });
});
