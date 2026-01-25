"use server";

import { auth } from "@/auth";
import { API_V1_URL } from "@/lib/constants";
import { Task, TaskFormValues, TaskReorderRequest } from "@/schemas/task";
import { revalidatePath } from "next/cache";

async function getAuthHeader() {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Unauthorized");
  }
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function getTasksAction(): Promise<{ success?: boolean; data?: Task[]; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_V1_URL}/tasks/`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { error: data?.detail || "Failed to fetch tasks." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return { error: "Internal server error." };
  }
}

export async function createTaskAction(values: TaskFormValues) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_V1_URL}/tasks/`, {
      method: "POST",
      headers,
      body: JSON.stringify(values),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { error: data?.detail || "Task creation failed." };
    }

    revalidatePath("/tasks");
    return { success: true, data };
  } catch (error) {
    console.error("Create Task Error:", error);
    return { error: "Internal server error." };
  }
}

export async function updateTaskAction(taskId: string, values: Partial<TaskFormValues>) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_V1_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(values),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { error: data?.detail || "Update failed." };
    }

    revalidatePath("/tasks");
    return { success: true, data };
  } catch (error) {
    console.error("Update Task Error:", error);
    return { error: "Internal server error." };
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_V1_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.detail || "Deletion failed." };
    }

    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("Delete Task Error:", error);
    return { error: "Internal server error." };
  }
}

export async function reorderTasksAction(request: TaskReorderRequest) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_V1_URL}/tasks/reorder`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.detail || "Reorder failed." };
    }

    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("Reorder Tasks Error:", error);
    return { error: "Internal server error." };
  }
}
