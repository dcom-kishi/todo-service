import logging

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from supabase_auth.errors import AuthApiError

from core.config import settings
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
        # Debug: Check if admin key is present
        if not settings.SUPABASE_SERVICE_ROLE_KEY:
            logging.error("SUPABASE_SERVICE_ROLE_KEY is missing!")
            raise HTTPException(
                status_code=500, detail="Server configuration error: missing admin key"
            )

        # 1. Prepare Auth data updates
        auth_attrs = {}
        if user_update.email:
            auth_attrs["email"] = user_update.email
        if user_update.password:
            auth_attrs["password"] = user_update.password

        metadata = {}
        if user_update.username is not None:
            metadata["username"] = user_update.username
        if user_update.avatar_url is not None:
            metadata["avatar_url"] = user_update.avatar_url

        if metadata:
            auth_attrs["user_metadata"] = metadata

        if auth_attrs:
            try:
                logging.info(
                    f"Updating Auth for user {current_user.id} with attributes: {list(auth_attrs.keys())}"
                )
                supabase_admin.auth.admin.update_user_by_id(
                    str(current_user.id), auth_attrs
                )
            except Exception as e:
                logging.error(f"Supabase Auth Admin Error: {str(e)}")
                # Continue if it's just a metadata sync failure, but log it

        # 2. Update Profiles table data
        profile_attrs = {}
        if user_update.username is not None:
            profile_attrs["username"] = user_update.username
        if user_update.avatar_url is not None:
            profile_attrs["avatar_url"] = user_update.avatar_url

        if profile_attrs:
            logging.info(f"Upserting Profiles table for user {current_user.id}")
            # Use upsert to handle cases where the profile record might be missing
            profile_attrs["id"] = str(current_user.id)
            response = supabase_admin.table("profiles").upsert(profile_attrs).execute()

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

        return UserProfile(
            id=current_user.id,
            email=user_update.email if user_update.email else current_user.email,
            username=user_update.username
            if user_update.username is not None
            else current_user.username,
            avatar_url=user_update.avatar_url
            if user_update.avatar_url is not None
            else current_user.avatar_url,
            updated_at=current_user.updated_at,
        )

    except Exception as e:
        import traceback

        error_details = traceback.format_exc()
        logging.error(f"Update User Detail Error:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

    except AuthApiError as e:
        logging.warning(f"Auth API error on updating user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data provided for update.",
        )
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
