import pytest
from unittest.mock import MagicMock
from core.deps import get_current_user
from schemas.user import UserProfile
from uuid import uuid4, UUID
from main import app
from datetime import datetime

@pytest.fixture
def mock_user_id():
    return uuid4()

@pytest.fixture
def mock_user_profile(mock_user_id):
    return UserProfile(
        id=mock_user_id,
        email="test@example.com",
        username="task_user"
    )

@pytest.fixture(autouse=True)
def override_current_user(mock_user_profile):
    app.dependency_overrides[get_current_user] = lambda: mock_user_profile
    yield
    app.dependency_overrides.pop(get_current_user, None)

class TestTasks:
    def test_create_task(self, client, mock_supabase_admin, mock_user_id):
        task_id = uuid4()
        mock_task = {
            "id": str(task_id),
            "title": "New Task",
            "description": "Task Description",
            "status": "TODO",
            "order_index": 0,
            "user_id": str(mock_user_id),
            "created_at": "2026-01-25T10:00:00+00:00",
            "updated_at": "2026-01-25T10:00:00+00:00"
        }
        
        mock_supabase_admin.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[mock_task])

        payload = {
            "title": "New Task",
            "description": "Task Description"
        }
        response = client.post("/api/v1/tasks/", json=payload)

        assert response.status_code == 201
        assert response.json()["title"] == "New Task"
        assert response.json()["id"] == str(task_id)

    def test_read_tasks(self, client, mock_supabase_admin, mock_user_id):
        mock_tasks = [
            {"id": str(uuid4()), "title": "T1", "status": "TODO", "user_id": str(mock_user_id), "order_index": 0, "created_at": "2026-01-25T10:00:00", "updated_at": "2026-01-25T10:00:00"},
            {"id": str(uuid4()), "title": "T2", "status": "DONE", "user_id": str(mock_user_id), "order_index": 1, "created_at": "2026-01-25T10:01:00", "updated_at": "2026-01-25T10:01:00"}
        ]
        
        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=mock_tasks)

        response = client.get("/api/v1/tasks/")

        assert response.status_code == 200
        assert len(response.json()) == 2
        assert response.json()[0]["title"] == "T1"

    def test_read_task_not_found(self, client, mock_supabase_admin):
        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=None)

        response = client.get(f"/api/v1/tasks/{uuid4()}")

        assert response.status_code == 404

    def test_update_task(self, client, mock_supabase_admin, mock_user_id):
        task_id = uuid4()
        updated_task = {
            "id": str(task_id),
            "title": "Updated Title",
            "status": "IN_PROGRESS",
            "user_id": str(mock_user_id),
            "order_index": 0,
            "created_at": "2026-01-25T10:00:00",
            "updated_at": "2026-01-25T11:00:00"
        }
        
        mock_supabase_admin.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[updated_task])

        payload = {"title": "Updated Title", "status": "IN_PROGRESS"}
        response = client.put(f"/api/v1/tasks/{task_id}", json=payload)

        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"
        assert response.json()["status"] == "IN_PROGRESS"

    def test_update_task_not_found_or_not_owned(self, client, mock_supabase_admin):
        # Simulate no rows updated (either ID not found or user_id mismatch)
        mock_supabase_admin.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

        payload = {"title": "Attempt Update"}
        response = client.put(f"/api/v1/tasks/{uuid4()}", json=payload)

        assert response.status_code == 404
        assert response.json()["detail"] == "Task not found or update failed"

    def test_update_task_empty_payload(self, client, mock_user_id):
        response = client.put(f"/api/v1/tasks/{uuid4()}", json={})

        assert response.status_code == 400
        assert response.json()["detail"] == "No fields to update provided."

    def test_reorder_tasks(self, client, mock_supabase_admin, mock_user_id):
        mock_supabase_admin.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": str(uuid4())}])

        payload = {
            "items": [
                {"id": str(uuid4()), "order_index": 1},
                {"id": str(uuid4()), "order_index": 0}
            ]
        }
        response = client.post("/api/v1/tasks/reorder", json=payload)

        assert response.status_code == 200
        assert response.json()["message"] == "Tasks reordered successfully"
        assert mock_supabase_admin.table.return_value.update.call_count == 2

    def test_delete_task(self, client, mock_supabase_admin):
        task_id = uuid4()
        mock_supabase_admin.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": str(task_id)}])

        response = client.delete(f"/api/v1/tasks/{task_id}")

        assert response.status_code == 204
