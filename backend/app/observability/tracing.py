"""OpenTelemetry tracing setup."""

from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

tracer = trace.get_tracer(__name__)


def setup_tracing():
    """Initialize OpenTelemetry tracing."""
    provider = TracerProvider()

    # Use console exporter for development
    if settings.environment == "development":
        console_exporter = ConsoleSpanExporter()
        provider.add_span_processor(BatchSpanProcessor(console_exporter))

    trace.set_tracer_provider(provider)

    logger.info("OpenTelemetry tracing initialized")


def instrument_fastapi(app):
    """Instrument FastAPI application with OpenTelemetry."""
    FastAPIInstrumentor.instrument_app(app)
    logger.info("FastAPI instrumented with OpenTelemetry")
