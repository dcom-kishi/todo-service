from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from core.supabase_client import get_supabase_admin
from schemas.auth import Token
from schemas.user import UserCreate, UserLogin
from gotrue.errors import AuthApiError

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
def signup(
    user_in: UserCreate,
    supabase: Client = Depends(get_supabase_admin)
):
    try:
        # 1. Sign up user in Supabase Auth
        avatar_url = user_in.avatar_url or "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
        
        auth_response = supabase.auth.sign_up({
            "email": user_in.email,
            "password": user_in.password,
            "options": {
                "data": {
                    "username": user_in.username,
                    "avatar_url": avatar_url
                }
            }
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        user_id = auth_response.user.id

        # 2. Create profile entry
        profile_data = {
            "id": user_id,
            "username": user_in.username,
            "avatar_url": avatar_url
        }
        
        # We use upsert=True just in case a trigger already created it to avoid race conditions
        supabase.table("profiles").upsert(profile_data).execute()

        return {"message": "User created successfully", "user_id": user_id}

    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/login", response_model=Token)
def login(
    user_in: UserLogin,
    supabase: Client = Depends(get_supabase_admin)
):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_in.email,
            "password": user_in.password,
        })
        
        if not auth_response.session:
             raise HTTPException(status_code=401, detail="Login failed")

        return Token(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            refresh_token=auth_response.session.refresh_token,
            user=auth_response.user.model_dump()
        )

    except AuthApiError as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/logout")
def logout(
    supabase: Client = Depends(get_supabase_admin)
):
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except HTTPException:
        raise
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
