import logging
import urllib.parse

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from supabase_auth.errors import AuthApiError

from core.config import settings
from core.supabase_client import get_supabase_admin
from schemas.auth import SignupResponse, Token
from schemas.user import UserCreate, UserLogin

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post(
    "/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED
)
def signup(user_in: UserCreate, supabase: Client = Depends(get_supabase_admin)):
    try:
        # 1. Sign up user in Supabase Auth
        avatar_url = (
            user_in.avatar_url
            or f"https://api.dicebear.com/7.x/avataaars/svg?seed={urllib.parse.quote(user_in.email)}"
        )

        # 1. Sign up user in Supabase Auth
        # Revert to dictionary format as keyword arguments are not supported in this version
        auth_response = supabase.auth.sign_up(
            {
                "email": user_in.email,
                "password": user_in.password,
                "options": {
                    "data": {"username": user_in.username, "avatar_url": avatar_url}
                },
            }
        )

        if not auth_response.user:
            raise HTTPException(
                status_code=400, detail="Signup failed: No user returned from Auth"
            )

        user_id = auth_response.user.id

        # 2. Ensure profile entry exists (The SQL trigger should have handled this)
        try:
            profile_data = {
                "id": user_id,
                "username": user_in.username,
                "avatar_url": avatar_url,
            }
            # Use upsert to update the record even if the trigger already created it
            supabase.table("profiles").upsert(profile_data).execute()
        except Exception as e:
            # We don't raise here because the user was already created in Auth
            # and the trigger might have already successfully created the profile.
            logging.warning(
                f"Profile upsert during signup had a non-critical issue: {e}"
            )

        return SignupResponse(message="User created successfully", user_id=user_id)

    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e.message))
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Signup Critical Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, supabase: Client = Depends(get_supabase_admin)):
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": user_in.email,
                "password": user_in.password,
            }
        )

        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Login failed")

        user_data = auth_response.user.model_dump()
        user_id = auth_response.user.id

        # Try to fetch the latest profile data from 'profiles' table
        try:
            profile_response = (
                supabase.table("profiles")
                .select("username, avatar_url")
                .eq("id", user_id)
                .single()
                .execute()
            )

            if profile_response.data:
                # Merge profile data into user_metadata for the frontend
                if (
                    "user_metadata" not in user_data
                    or user_data["user_metadata"] is None
                ):
                    user_data["user_metadata"] = {}

                user_data["user_metadata"]["username"] = profile_response.data.get(
                    "username"
                )
                user_data["user_metadata"]["avatar_url"] = profile_response.data.get(
                    "avatar_url"
                )
            else:
                raise Exception("Profile not found")

        except Exception:
            # If profile is missing in DB but user exists in Auth, try to recover
            logging.warning(f"Profile missing for user {user_id}. Attempting recovery.")
            metadata = user_data.get("user_metadata") or {}
            username = metadata.get("username") or user_in.email.split("@")[0]
            avatar_url = (
                metadata.get("avatar_url")
                or f"https://api.dicebear.com/7.x/avataaars/svg?seed={urllib.parse.quote(user_in.email)}"
            )

            try:
                supabase.table("profiles").upsert(
                    {"id": user_id, "username": username, "avatar_url": avatar_url}
                ).execute()
            except Exception as e:
                logging.error(f"Failed to recover profile: {e}")

        return Token(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            refresh_token=auth_response.session.refresh_token,
            user=user_data,
        )

    except AuthApiError as e:
        logging.warning(f"Login failed for email {user_in.email}: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/logout")
def logout(supabase: Client = Depends(get_supabase_admin)):
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Logout Error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during logout")
