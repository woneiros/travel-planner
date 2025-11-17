"""Unified LLM client supporting OpenAI and Anthropic via LangChain."""

from typing import Literal

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI

from app.config import settings
from app.observability.langfuse_client import observe
from app.utils.errors import LLMProviderError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

LLMProvider = Literal["openai", "anthropic"]

CLAUDE_MODEL_NAME = "claude-3-5-haiku-latest"


class LLMClient:
    """Unified LLM client that abstracts OpenAI and Anthropic."""

    def __init__(self, provider: LLMProvider):
        """
        Initialize LLM client with specified provider.

        Args:
            provider: Either "openai" or "anthropic"

        Raises:
            LLMProviderError: If provider is invalid or API key is missing
        """
        self.provider = provider
        self._model = self._initialize_model()

    def _initialize_model(self) -> BaseChatModel:
        """
        Initialize the appropriate LangChain model based on provider.

        Returns:
            LangChain chat model instance

        Raises:
            LLMProviderError: If initialization fails
        """
        try:
            if self.provider == "openai":
                if not settings.openai_api_key:
                    raise LLMProviderError("OpenAI API key not configured")

                logger.info("Initializing OpenAI model (gpt-4)")
                return ChatOpenAI(
                    model="gpt-4",
                    temperature=0.7,
                    api_key=settings.openai_api_key,
                )

            elif self.provider == "anthropic":
                if not settings.anthropic_api_key:
                    raise LLMProviderError("Anthropic API key not configured")

                logger.info(f"Initializing Anthropic model ({CLAUDE_MODEL_NAME})")
                return ChatAnthropic(
                    model=CLAUDE_MODEL_NAME,
                    temperature=0.1,
                    api_key=settings.anthropic_api_key,
                    timeout=60,
                )

            else:
                raise LLMProviderError(f"Unknown provider: {self.provider}")

        except Exception as e:
            error_msg = f"Failed to initialize {self.provider} model: {str(e)}"
            logger.error(error_msg)
            raise LLMProviderError(error_msg) from e

    @observe(as_type="generation")
    async def invoke(self, messages: list[dict]) -> str:
        """
        Invoke the LLM with messages and return the response.

        Args:
            messages: List of message dictionaries with 'role' and 'content'

        Returns:
            LLM response text

        Raises:
            LLMProviderError: If invocation fails
        """
        try:
            # Convert messages to LangChain format
            langchain_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    from langchain_core.messages import SystemMessage

                    langchain_messages.append(SystemMessage(content=msg["content"]))
                elif msg["role"] == "user":
                    from langchain_core.messages import HumanMessage

                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    from langchain_core.messages import AIMessage

                    langchain_messages.append(AIMessage(content=msg["content"]))

            # Invoke the model
            response = await self._model.ainvoke(langchain_messages)

            logger.info(f"LLM invocation successful using {self.provider}")
            return response.content

        except Exception as e:
            error_msg = f"LLM invocation failed ({self.provider}): {str(e)}"
            logger.error(error_msg)
            raise LLMProviderError(error_msg) from e

    @observe(as_type="generation")
    async def invoke_structured(self, messages: list[dict], schema: type) -> object:
        """
        Invoke the LLM and parse response into structured format using Pydantic.

        Args:
            messages: List of message dictionaries
            schema: Pydantic model class for structured output

        Returns:
            Parsed structured output of type `schema`

        Raises:
            LLMProviderError: If invocation or parsing fails
        """
        try:
            # Use LangChain's structured output capability
            structured_llm = self._model.with_structured_output(schema)

            # Convert messages
            langchain_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    from langchain_core.messages import SystemMessage

                    langchain_messages.append(SystemMessage(content=msg["content"]))
                elif msg["role"] == "user":
                    from langchain_core.messages import HumanMessage

                    langchain_messages.append(HumanMessage(content=msg["content"]))

            # Invoke with structured output
            result = await structured_llm.ainvoke(langchain_messages)

            logger.info(f"Structured LLM invocation successful using {self.provider}")

            logger.info("Structured LLM invocation result of type: %s", type(result))
            logger.info("Structured LLM invocation result: %s", result)

            return result
            # # Convert Pydantic model to dict
            # if hasattr(result, "model_dump"):
            #     return result.model_dump()
            # elif hasattr(result, "dict"):
            #     return result.dict()
            # else:
            #     return dict(result)

        except Exception as e:
            error_msg = f"Structured LLM invocation failed ({self.provider}): {str(e)}"
            logger.error(error_msg)
            raise LLMProviderError(error_msg) from e

    def get_model_name(self) -> str:
        """Get the name of the current model."""
        if self.provider == "openai":
            return "gpt-4"
        elif self.provider == "anthropic":
            return CLAUDE_MODEL_NAME
        return "unknown"


def create_llm_client(provider: LLMProvider) -> LLMClient:
    """
    Factory function to create an LLM client.

    Args:
        provider: LLM provider name

    Returns:
        Configured LLM client

    Raises:
        LLMProviderError: If client creation fails
    """
    return LLMClient(provider)
