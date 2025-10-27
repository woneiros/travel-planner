"""Chat message data models."""

from datetime import datetime

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Represents a chat message in a conversation."""

    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    places_referenced: list[str] = Field(default_factory=list)
