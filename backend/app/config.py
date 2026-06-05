from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        # Strip whitespace and trailing slashes so Render env var formatting doesn't break matching
        origins = [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]
        return origins

    class Config:
        env_file = ".env"


settings = Settings()
