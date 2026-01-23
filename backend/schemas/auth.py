from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Dict, Any

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

class SignupResponse(BaseModel):
    message: str
    user_id: UUID