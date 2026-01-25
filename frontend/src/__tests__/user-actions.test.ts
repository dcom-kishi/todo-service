import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted を使用して変数を引き上げる
const { mockAuth, mockRevalidatePath } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
  auth: mockAuth,
}));

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

// next-auth もモックして依存関係エラーを回避
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    auth: mockAuth,
  })),
}));

import { updateProfileAction, deleteAccountAction } from '../actions/user';

// global.fetch のモック
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('User Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ accessToken: 'fake-token' });
  });

  describe('updateProfileAction', () => {
    it('calls backend API with correct parameters', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', username: 'newname' }),
      });

      const result = await updateProfileAction({ username: 'newname' });

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
          body: JSON.stringify({ username: 'newname' }),
        })
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith('/profile');
    });

    it('returns error when API returns an error status', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Invalid username' }),
      });

      const result = await updateProfileAction({ username: 'invalid' });

      expect(result.success).toBeUndefined();
      expect(result.error).toBe('Invalid username');
    });

    it('returns error when fetch fails', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await updateProfileAction({ username: 'newname' });

      expect(result.error).toBe('Internal server error.');
    });

    it('returns default error message when API returns non-JSON error', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => { throw new Error('Not JSON'); },
      });

      const result = await updateProfileAction({ username: 'newname' });

      expect(result.error).toBe('Update failed.');
    });

    it('returns error when unauthorized', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await updateProfileAction({ username: 'newname' });

      expect(result.error).toBe('Internal server error.');
    });
  });

  describe('deleteAccountAction', () => {
    it('calls backend API with DELETE method', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
      });

      const result = await deleteAccountAction();

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });

    it('returns error when deletion fails', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Cannot delete account' }),
      });

      const result = await deleteAccountAction();

      expect(result.error).toBe('Cannot delete account');
    });

    it('returns default error message when API returns non-JSON error on deletion', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => { throw new Error('Not JSON'); },
      });

      const result = await deleteAccountAction();

      expect(result.error).toBe('Deletion failed.');
    });
  });
});
