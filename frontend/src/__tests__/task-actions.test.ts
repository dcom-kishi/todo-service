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

// next-auth もモック
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    auth: mockAuth,
  })),
}));

import { getTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from '../actions/task';

// global.fetch のモック
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Task Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ accessToken: 'fake-token' });
  });

  describe('getTasksAction', () => {
    it('fetches tasks successfully', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => [{ id: '1', title: 'Task 1' }],
      });

      const result = await getTasksAction();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('createTaskAction', () => {
    it('creates a task successfully', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '2', title: 'New Task' }),
      });

      const result = await createTaskAction({ title: 'New Task', status: 'TODO', order_index: 0 });

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('updateTaskAction', () => {
    it('updates a task successfully', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1', title: 'Updated' }),
      });

      const result = await updateTaskAction('1', { title: 'Updated' });

      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('deleteTaskAction', () => {
    it('deletes a task successfully', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
      });

      const result = await deleteTaskAction('1');

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith('/tasks');
    });
  });
});
