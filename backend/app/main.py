"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, ingest
from app.config import settings
from app.observability.tracing import setup_tracing
from app.utils.logger import setup_logger
from app.version import VERSION

logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    logger.info("Starting Treki API")
    setup_tracing()

    # Start session manager
    from app.services.session_manager import get_session_manager

    session_manager = get_session_manager()
    await session_manager.start()

    yield

    # Stop session manager
    await session_manager.stop()
    logger.info("Shutting down Treki API")


app = FastAPI(
    title="Treki API",
    description="AI-powered travel planning from YouTube videos",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Version
@app.get("/version")
async def get_version():
    """Version endpoint."""
    return {"version": VERSION}


# Include routers
app.include_router(ingest.router, prefix="/api", tags=["ingest"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
