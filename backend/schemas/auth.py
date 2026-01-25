from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None


class SignupResponse(BaseModel):
    message: str
    user_id: UUID
