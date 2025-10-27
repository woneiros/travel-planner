"""Langfuse integration for LLM observability."""

import inspect
from functools import wraps

from langfuse import Langfuse

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


def observe():
    """
    Decorator for observing functions with Langfuse.
    This is a simplified version for MVP - just passes through the function.
    In production, integrate with Langfuse's observe decorator when available.
    """

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # For MVP, just call the function
            # In production, add Langfuse tracing here
            return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        # Return appropriate wrapper based on function type
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


__all__ = ["langfuse_client", "get_langfuse", "observe"]
