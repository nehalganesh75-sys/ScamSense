import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "ScamSense API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: Supports PostgreSQL or local SQLite fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./scamsense.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "scamsense-super-secret-production-dev-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
    ]

    # Analysis limits
    MAX_CONTENT_LENGTH: int = 25000
    RATE_LIMIT_PER_MINUTE: int = 60

    # Optional 3rd Party Reputation Keys (kept safely on backend)
    SAFE_BROWSING_API_KEY: Union[str, None] = os.getenv("SAFE_BROWSING_API_KEY", None)
    
    # Pre-seed demo datasets if empty
    ENABLE_DEMO_SEED: bool = True

settings = Settings()
