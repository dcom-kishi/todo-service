from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Allow loading from .env files for local development
    # If variables are already set in environment (like by Docker), they take precedence.
    model_config = SettingsConfigDict(
        env_file=("../.env", "../.env.local"),
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()