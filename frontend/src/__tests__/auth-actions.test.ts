import { describe, it, expect, vi, beforeEach } from 'vitest';

// next-auth をグローバルにモックする
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
  AuthError: class extends Error {
    type: string = 'AuthError';
  },
}));

// vi.hoisted を使用して変数を引き上げる
const { mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('@/auth', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

import { loginAction, signupAction, logoutAction } from '../actions/auth';

// global.fetch のモック
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginAction', () => {
    it('calls signIn with correct parameters', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await loginAction(formData);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirectTo: '/',
      });
    });
  });

  describe('signupAction', () => {
    it('returns success when API call is successful', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1' }),
      });

      const result = await signupAction({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('logoutAction', () => {
    it('calls signOut with correct parameters', async () => {
      await logoutAction();

      expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/login' });
    });
  });
});