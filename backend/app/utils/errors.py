"""Custom exceptions."""


class TravelPlannerException(Exception):
    """Base exception for the application."""

    pass


class YouTubeTranscriptError(TravelPlannerException):
    """Raised when YouTube transcript cannot be fetched."""

    pass


class InvalidSessionError(TravelPlannerException):
    """Raised when session ID is invalid or expired."""

    pass


class LLMProviderError(TravelPlannerException):
    """Raised when LLM provider encounters an error."""

    pass


class ExtractionError(TravelPlannerException):
    """Raised when place extraction fails."""

    pass
