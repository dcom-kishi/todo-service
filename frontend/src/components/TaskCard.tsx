"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/schemas/task";
import { Card } from "./ui";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative bg-white dark:bg-card hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-sm hover:shadow-md ring-1 ring-black/5 dark:ring-white/5"
    >
      <div className="p-3 flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical size={18} />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-card-foreground text-sm sm:text-base truncate">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => onEdit(task)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}