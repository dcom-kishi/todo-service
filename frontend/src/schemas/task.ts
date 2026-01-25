import * as z from "zod";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  order_index: z.number().int().default(0),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TaskReorderItem {
  id: string;
  order_index: number;
}

export interface TaskReorderRequest {
  items: TaskReorderItem[];
}
