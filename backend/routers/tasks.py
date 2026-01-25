import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.deps import get_current_user
from core.supabase_client import get_supabase_admin
from schemas.task import Task, TaskCreate, TaskReorderRequest, TaskUpdate
from schemas.user import UserProfile

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)


@router.get("/", response_model=List[Task])
def read_tasks(
    current_user: UserProfile = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """
    Retrieve all tasks for the current user.
    """
    response = (
        supabase.table("tasks")
        .select("*")
        .eq("user_id", str(current_user.id))
        .order("order_index", desc=False)
        .execute()
    )
    return response.data


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: UserProfile = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """
    Create a new task for the current user.
    """
    task_data = task_in.model_dump()
    task_data["user_id"] = str(current_user.id)

    response = supabase.table("tasks").insert(task_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Task creation failed")

    return response.data[0]


@router.post("/reorder", status_code=status.HTTP_200_OK)
def reorder_tasks(
    reorder_in: TaskReorderRequest,
    current_user: UserProfile = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """
    Bulk update task order indices.
    """
    try:
        # Note: Supabase doesn't support bulk update with different values in a
        # single call easily via table.update().
        # For simplicity and correctness (ensuring user owns the tasks), we iterate.
        # In a real high-load app, we might use a RPC (PostgreSQL function).
        for item in reorder_in.items:
            supabase.table("tasks").update(
                {"order_index": item.order_index, "updated_at": "now()"}
            ).eq("id", str(item.id)).eq("user_id", str(current_user.id)).execute()

        return {"message": "Tasks reordered successfully"}
    except Exception as e:
        logging.error(f"Reorder Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reorder tasks")


@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """
    Get a specific task by ID.
    """
    response = (
        supabase.table("tasks")
        .select("*")
        .eq("id", str(task_id))
        .eq("user_id", str(current_user.id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return response.data


@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: UserProfile = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """
    Update a specific task.
    """
    update_data = task_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update provided.",
        )

    update_data["updated_at"] = "now()"

    response = (
        supabase.table("tasks")
        .update(update_data)
        .eq("id", str(task_id))
        .eq("user_id", str(current_user.id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found or update failed")

    return response.data[0]


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    current_user: UserProfile = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """
    Delete a specific task.
    """
    response = (
        supabase.table("tasks")
        .delete()
        .eq("id", str(task_id))
        .eq("user_id", str(current_user.id))
        .execute()
    )

    if not response.data:
        # If response.data is empty, it means no rows were deleted (likely not found)
        raise HTTPException(status_code=404, detail="Task not found")

    return None
