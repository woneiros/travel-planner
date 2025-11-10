"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # LLM API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Observability
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    # Clerk Authentication
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""

    # Application
    environment: str = "development"
    log_level: str = "INFO"
    session_ttl_seconds: int = 3600

    # API
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://treki.promptreplay.ai",
    ]


settings = Settings()
