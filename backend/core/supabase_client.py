from supabase import Client, create_client

from .config import settings


def get_supabase_admin() -> Client:
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
