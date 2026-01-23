from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
from .supabase_client import get_supabase
from schemas.user import UserProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    supabase: Annotated[Client, Depends(get_supabase)]
) -> UserProfile:
    """
    Validates the JWT token using Supabase Auth and returns the current user profile.
    """
    try:
        # 1. Verify token and get user from Supabase Auth
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 2. Fetch additional profile info from 'profiles' table
        # Note: We use single() because we expect exactly one profile per user
        profile_response = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        
        profile_data = profile_response.data if profile_response.data else {}
        
        # Merge Auth user data with Profile data
        # Email comes from Auth, other fields from Profile
        return UserProfile(
            id=user.id,
            email=user.email,
            username=profile_data.get("username"),
            avatar_url=profile_data.get("avatar_url"),
            updated_at=profile_data.get("updated_at")
        )

    except Exception as e:
        # Differentiate between specific Supabase errors if needed, 
        # but for now catch generic auth failures
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
