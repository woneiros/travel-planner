"""Place/location data models."""

from datetime import datetime
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field


class PlaceType(str, Enum):
    """Types of places that can be extracted."""

    RESTAURANT = "restaurant"
    ATTRACTION = "attraction"
    HOTEL = "hotel"
    ACTIVITY = "activity"
    COFFEE_SHOP = "coffee_shop"
    SHOPPING = "shopping"
    OTHER = "other"


class Place(BaseModel):
    """Represents a place mentioned in a travel video."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    type: PlaceType
    description: str
    video_id: str
    timestamp_seconds: int | None = None
    mentioned_context: str
    address: str | None = Field(
        default=None, description="Full address of the place if mentioned in transcript"
    )
    neighborhood: str | None = Field(
        default=None, description="Neighborhood or district area if mentioned in transcript"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
