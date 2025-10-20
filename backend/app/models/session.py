"""Session data models."""

from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field

from app.models.chat import ChatMessage
from app.models.place import Place
from app.models.video import Video


class Session(BaseModel):
    """Represents a user session with videos, places, and chat history."""

    session_id: str = Field(default_factory=lambda: str(uuid4()))
    videos: list[Video] = Field(default_factory=list)
    places: list[Place] = Field(default_factory=list)
    chat_history: list[ChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
