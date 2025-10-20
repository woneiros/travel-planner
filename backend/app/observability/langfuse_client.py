"""Langfuse integration for LLM observability."""

from langfuse import Langfuse
from langfuse.decorators import observe

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Initialize Langfuse client
langfuse_client: Langfuse | None = None

if settings.langfuse_public_key and settings.langfuse_secret_key:
    langfuse_client = Langfuse(
        public_key=settings.langfuse_public_key,
        secret_key=settings.langfuse_secret_key,
        host=settings.langfuse_host,
    )
    logger.info("Langfuse client initialized")
else:
    logger.warning("Langfuse credentials not provided, observability will be limited")


def get_langfuse() -> Langfuse | None:
    """Get the Langfuse client instance."""
    return langfuse_client


# Re-export the observe decorator for convenience
__all__ = ["langfuse_client", "get_langfuse", "observe"]
