import { auth } from "@/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";

export default async function TasksPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
