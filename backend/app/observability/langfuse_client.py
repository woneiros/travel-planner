"""Langfuse integration for LLM observability."""

from langfuse import Langfuse, observe

from app.config import settings
from app.observability.privacy import pii_masker
from app.utils.logger import setup_logger
from app.version import VERSION

logger = setup_logger(__name__)

# Initialize Langfuse client
langfuse_client: Langfuse | None = None


if settings.langfuse_public_key and settings.langfuse_secret_key:
    langfuse_client = Langfuse(
        public_key=settings.langfuse_public_key,
        secret_key=settings.langfuse_secret_key,
        host=settings.langfuse_host,
        release=VERSION,
        mask=pii_masker,
    )
    logger.info("Langfuse client initialized")
else:
    logger.warning("Langfuse credentials not provided, observability will be limited")


def get_langfuse() -> Langfuse:
    """Get the Langfuse client instance."""
    if not langfuse_client:
        raise RuntimeError("Langfuse client is not initialized")
    return langfuse_client


__all__ = ["langfuse_client", "get_langfuse", "observe"]
