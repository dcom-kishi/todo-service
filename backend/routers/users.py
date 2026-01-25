import logging

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from supabase_auth.errors import AuthApiError

from core.deps import get_current_user
from core.supabase_client import get_supabase_admin
from schemas.user import UserProfile, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/me", response_model=UserProfile)
def read_users_me(current_user: UserProfile = Depends(get_current_user)):
    """
    Get current user profile.
    """
    return current_user


@router.put("/me", response_model=UserProfile)
def update_user_me(
    user_update: UserUpdate,
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin),
):
    """
    Update current user profile.
    """
    try:
        # 1. Update Auth data (Email/Password) if provided
        auth_attrs = {}
        if user_update.email:
            auth_attrs["email"] = user_update.email
        if user_update.password:
            auth_attrs["password"] = user_update.password

        if auth_attrs:
            # We use admin client because we don't have user session
            # (access+refresh token) here.
            # Only access token is available from get_current_user dependency.
            supabase_admin.auth.admin.update_user_by_id(
                str(current_user.id), auth_attrs
            )

        # 2. Update Profiles table data
        profile_attrs = {}
        if user_update.username is not None:
            profile_attrs["username"] = user_update.username
        if user_update.avatar_url is not None:
            profile_attrs["avatar_url"] = user_update.avatar_url

        if profile_attrs:
            # Update user_metadata in Auth to keep it in sync
            # This is important because the frontend session often relies on user_metadata
            supabase_admin.auth.admin.update_user_by_id(
                str(current_user.id),
                {"user_metadata": profile_attrs}
            )

            # Fetch updated data from DB to get the server-side updated_at
            response = (
                supabase_admin.table("profiles")
                .update(profile_attrs)
                .eq("id", current_user.id)
                .execute()
            )

            if response.data:
                updated_profile = response.data[0]
                return UserProfile(
                    id=current_user.id,
                    email=user_update.email
                    if user_update.email
                    else current_user.email,
                    username=updated_profile.get("username"),
                    avatar_url=updated_profile.get("avatar_url"),
                    updated_at=updated_profile.get("updated_at"),
                )

        # 3. Return updated profile (If no profile fields were changed but auth
        # fields were)
        return UserProfile(
            id=current_user.id,
            email=user_update.email if user_update.email else current_user.email,
            username=current_user.username,
            avatar_url=current_user.avatar_url,
            updated_at=current_user.updated_at,
        )

    except AuthApiError as e:
        logging.warning(f"Auth API error on updating user {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid data provided for update.")
    except Exception as e:
        logging.error(f"Update User Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update user profile",
        )


@router.delete("/me")
def delete_user_me(
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin: Client = Depends(get_supabase_admin),
):
    """
    Delete current user account.
    """
    try:
        # Delete the auth user using admin client.
        # This will trigger ON DELETE CASCADE on profiles and tasks tables.
        supabase_admin.auth.admin.delete_user(str(current_user.id))

        return {"message": "Account deleted successfully"}

    except Exception as e:
        logging.error(f"Delete User Error: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error during account deletion"
        )
