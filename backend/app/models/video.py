"""Video data models."""

from pydantic import BaseModel


class Video(BaseModel):
    """Represents a YouTube video with its transcript."""

    video_id: str
    title: str
    description: str | None = None
    summary: str | None = None
    duration_seconds: int
    transcript: str
    url: str
    places_count: int | None = None


class VideoSummary(BaseModel):
    """Summary of a processed video."""

    video_id: str
    title: str
    summary: str
    places_count: int
