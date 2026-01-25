"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Task, TaskStatus, TaskFormValues } from "@/schemas/task";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import TaskFormModal from "./TaskFormModal";
import { 
  getTasksAction, 
  createTaskAction, 
  updateTaskAction, 
  deleteTaskAction,
  reorderTasksAction 
} from "@/actions/task";
import { Button } from "./ui";
import { Plus, RefreshCcw } from "lucide-react";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    setIsLoading(true);
    const result = await getTasksAction();
    if (result.success && result.data) {
      setTasks(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // 別のカラムへドロップした場合の処理
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.id === "TODO" || over.id === "IN_PROGRESS" || over.id === "DONE";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].status = over.id as TaskStatus;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // DB更新
    // ステータスと順序を同期
    const tasksInStatus = tasks.filter(t => t.status === task.status);
    const reorderItems = tasksInStatus.map((t, index) => ({
      id: t.id,
      order_index: index
    }));

    await updateTaskAction(task.id as string, { status: task.status });
    await reorderTasksAction({ items: reorderItems });
  };

  const handleCreateTask = async (values: TaskFormValues) => {
    setIsPending(true);
    const result = await createTaskAction(values);
    if (result.success) {
      await fetchTasks();
      setIsModalOpen(false);
    }
    setIsPending(false);
  };

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (!editingTask) return;
    setIsPending(true);
    const result = await updateTaskAction(editingTask.id, values);
    if (result.success) {
      await fetchTasks();
      setIsModalOpen(false);
      setEditingTask(null);
    }
    setIsPending(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const result = await deleteTaskAction(id);
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const columns: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: "To Do" },
    { status: "IN_PROGRESS", title: "In Progress" },
    { status: "DONE", title: "Done" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCcw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.status)}
              onEditTask={openEditModal}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {isModalOpen && (
        <TaskFormModal
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          isPending={isPending}
        />
      )}
    </div>
  );
}
