"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/schemas/task";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function KanbanColumn({
  status,
  title,
  tasks,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col w-full min-w-[300px] bg-gray-100 rounded-lg p-4 h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          {title}
          <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
