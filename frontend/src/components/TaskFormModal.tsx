"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormValues, Task } from "@/schemas/task";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui";
import { X } from "lucide-react";

interface TaskFormModalProps {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  isPending: boolean;
}

export default function TaskFormModal({ task, onClose, onSubmit, isPending }: TaskFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "TODO",
      order_index: task?.order_index ?? 0,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-card-foreground">{task ? "Edit Task" : "Create New Task"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending}>
            <X size={20} className="text-muted-foreground" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Buy groceries"
                {...register("title")}
                disabled={isPending}
                className="bg-background border-border text-foreground"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Milk, eggs, and bread..."
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 text-foreground placeholder:text-muted-foreground transition-colors"
                {...register("description")}
                disabled={isPending}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 text-foreground transition-colors"
                {...register("status")}
                disabled={isPending}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
