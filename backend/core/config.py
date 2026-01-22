import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env and .env.local
load_dotenv(dotenv_path="../.env")
load_dotenv(dotenv_path="../.env.local")

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

settings = Settings()
