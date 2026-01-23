import pytest
from unittest.mock import MagicMock
from core.deps import get_current_user
from schemas.user import UserProfile
from uuid import uuid4

@pytest.fixture
def mock_user_profile():
    return UserProfile(
        id=uuid4(),
        email="test@example.com",
        username="existing_user",
        avatar_url="http://example.com/avatar.png"
    )

class TestUsers:
    def test_get_users_me(self, client, mock_user_profile):
        from main import app
        app.dependency_overrides[get_current_user] = lambda: mock_user_profile

        response = client.get("/api/v1/users/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == mock_user_profile.email
        assert data["username"] == mock_user_profile.username

        app.dependency_overrides.pop(get_current_user)

    def test_update_user_me_success(self, client, mock_supabase, mock_supabase_admin, mock_user_profile):
        from main import app
        app.dependency_overrides[get_current_user] = lambda: mock_user_profile

        updated_data = {
            "id": str(mock_user_profile.id),
            "username": "new_username",
            "avatar_url": "http://example.com/new_avatar.png",
            "updated_at": "2026-01-23T12:00:00Z"
        }
        
        def table_side_effect(table_name):
            mock_builder = MagicMock()
            if table_name == "profiles":
                mock_builder.update.return_value = mock_builder
                mock_builder.eq.return_value = mock_builder
                mock_builder.execute.return_value = MagicMock()
                
                mock_builder.select.return_value = mock_builder
                mock_builder.single.return_value = mock_builder
                mock_builder.execute.return_value = MagicMock(data=updated_data)
            return mock_builder

        mock_supabase.table.side_effect = table_side_effect
        mock_supabase_admin.auth.admin.update_user_by_id.return_value = MagicMock()

        # Execute
        payload = {
            "username": "new_username",
            "password": "NewValidPassword123!"
        }
        response = client.put("/api/v1/users/me", json=payload)

        # Assert
        assert response.status_code == 200
        assert response.json()["username"] == "new_username"
        mock_supabase_admin.auth.admin.update_user_by_id.assert_called_once()

        app.dependency_overrides.pop(get_current_user)

    def test_update_user_me_validation_error(self, client, mock_user_profile):
        from main import app
        app.dependency_overrides[get_current_user] = lambda: mock_user_profile

        # Invalid password (no symbol)
        payload = {
            "password": "NoSymbol123"
        }
        response = client.put("/api/v1/users/me", json=payload)

        assert response.status_code == 422
        assert "at least one symbol" in response.json()["detail"][0]["msg"]

        app.dependency_overrides.pop(get_current_user)

    def test_delete_user_me(self, client, mock_supabase_admin, mock_user_profile):
        from main import app
        app.dependency_overrides[get_current_user] = lambda: mock_user_profile

        mock_supabase_admin.auth.admin.delete_user.return_value = MagicMock()

        response = client.delete("/api/v1/users/me")

        assert response.status_code == 200
        assert response.json()["message"] == "Account deleted successfully"
        mock_supabase_admin.auth.admin.delete_user.assert_called_once_with(str(mock_user_profile.id))

        app.dependency_overrides.pop(get_current_user)