"""Logging configuration."""

import logging
import sys

from app.config import settings


def setup_logger(name: str = __name__) -> logging.Logger:
    """
    Set up and return a configured logger.

    Args:
        name: Logger name, typically __name__ of the calling module

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(settings.log_level)

    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(settings.log_level)

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)

    # Add handler if not already added
    if not logger.handlers:
        logger.addHandler(handler)

    return logger
