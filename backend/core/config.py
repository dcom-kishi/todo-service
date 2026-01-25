from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str | None = None

    DEFAULT_AVATAR_URL: str = "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    USERNAME_NG_WORDS: list[str] = ["admin", "root", "support"]

    # Allow loading from .env files for local development
    # If variables are already set in environment (like by Docker),
    # they take precedence.
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", "../.env", "../.env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
