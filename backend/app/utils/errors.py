"""Custom exceptions."""


class TrekiException(Exception):
    """Base exception for the application."""

    pass


class YouTubeTranscriptError(TrekiException):
    """Raised when YouTube transcript cannot be fetched."""

    pass


class InvalidSessionError(TrekiException):
    """Raised when session ID is invalid or expired."""

    pass


class LLMProviderError(TrekiException):
    """Raised when LLM provider encounters an error."""

    pass


class ExtractionError(TrekiException):
    """Raised when place extraction fails."""

    pass
