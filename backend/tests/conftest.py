import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from main import app
from core.supabase_client import get_supabase_admin


# Mock Supabase Admin Client
@pytest.fixture
def mock_supabase_admin():
    return MagicMock()

# Override the dependencies
@pytest.fixture
def client(mock_supabase_admin):
    app.dependency_overrides[get_supabase_admin] = lambda: mock_supabase_admin
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
