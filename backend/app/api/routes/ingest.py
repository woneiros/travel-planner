"""Video ingestion endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/ingest")
async def ingest_videos():
    """
    Ingest YouTube videos and extract places.

    Accepts 1-10 YouTube URLs, fetches transcripts, extracts places using LLM.
    """
    # TODO: Implement video ingestion
    return {"message": "Ingest endpoint - to be implemented"}
