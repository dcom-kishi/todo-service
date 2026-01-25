from unittest.mock import MagicMock
from uuid import uuid4


class TestAuth:
    def test_signup_success(self, client, mock_supabase_admin):
        # Setup Mock
        user_id = str(uuid4())
        mock_user = MagicMock()
        mock_user.id = user_id

        mock_auth_response = MagicMock()
        mock_auth_response.user = mock_user
        mock_supabase_admin.auth.sign_up.return_value = mock_auth_response

        mock_postgrest_builder = MagicMock()
        mock_supabase_admin.table.return_value = mock_postgrest_builder
        mock_postgrest_builder.upsert.return_value = mock_postgrest_builder
        mock_postgrest_builder.execute.return_value = MagicMock(data=[{"id": user_id}])

        # Execute
        payload = {
            "email": "test@example.com",
            "password": "Password123!",  # Valid password
            "username": "testuser",
            "avatar_url": "http://example.com/avatar.png",
        }
        response = client.post("/api/v1/auth/signup", json=payload)

        # Assert
        assert response.status_code == 201
        assert response.json() == {
            "message": "User created successfully",
            "user_id": user_id,
        }

    def test_signup_password_validation_errors(self, client):
        # Case 1: Too short
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "Short1!",
                "username": "testuser",
            },
        )
        assert response.status_code == 422
        assert "at least 8 characters" in response.json()["detail"][0]["msg"]

        # Case 2: No number
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "NoNumber!",
                "username": "testuser",
            },
        )
        assert response.status_code == 422
        assert "at least one number" in response.json()["detail"][0]["msg"]

        # Case 3: No symbol
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "NoSymbol123",
                "username": "testuser",
            },
        )
        assert response.status_code == 422
        assert "at least one symbol" in response.json()["detail"][0]["msg"]

    def test_signup_invalid_username(self, client):
        # NG word: admin
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "Password123!",
                "username": "admin",
            },
        )
        assert response.status_code == 422
        assert "not allowed" in response.json()["detail"][0]["msg"]

    def test_login_success(self, client, mock_supabase_admin):
        # Setup Mock
        mock_user = MagicMock()
        mock_user.email = "test@example.com"
        mock_user.model_dump.return_value = {
            "id": "test-user-id",
            "email": "test@example.com",
        }

        mock_session = MagicMock()
        mock_session.access_token = "fake-access-token"
        mock_session.refresh_token = "fake-refresh-token"

        mock_auth_response = MagicMock()
        mock_auth_response.user = mock_user
        mock_auth_response.session = mock_session

        mock_supabase_admin.auth.sign_in_with_password.return_value = mock_auth_response

        # Execute
        payload = {"email": "test@example.com", "password": "Password123!"}
        response = client.post("/api/v1/auth/login", json=payload)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "fake-access-token"
        assert data["user"]["email"] == "test@example.com"

    def test_login_failure(self, client, mock_supabase_admin):
        # Setup Mock
        mock_auth_response = MagicMock()
        mock_auth_response.session = None
        mock_supabase_admin.auth.sign_in_with_password.return_value = mock_auth_response

        # Execute
        payload = {"email": "wrong@example.com", "password": "WrongPassword123!"}
        response = client.post("/api/v1/auth/login", json=payload)

        # Assert
        assert response.status_code == 401
        assert response.json()["detail"] == "Login failed"

    def test_logout(self, client, mock_supabase_admin):
        # Execute
        response = client.post("/api/v1/auth/logout")

        # Assert
        assert response.status_code == 200
        assert response.json() == {"message": "Logged out successfully"}
        mock_supabase_admin.auth.sign_out.assert_called_once()
