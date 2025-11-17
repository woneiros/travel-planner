"""Chat agent with tools for querying places."""

from typing import Any

from langchain_core.tools import tool

from app.models.place import Place, PlaceType
from app.models.session import Session
from app.observability.langfuse_client import observe
from app.services.llm_client import LLMClient
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def create_search_places_tool(places: list[Place]):
    """Create a tool for searching places with closure over the places list."""

    @tool
    def search_places(
        query: str = "", place_type: str = "", limit: int = 10
    ) -> list[dict[str, Any]]:
        """
        Search for places by name, description, or type.

        Args:
            query: Search query to match against name, description, or context
            place_type: Filter by place type (restaurant, attraction, hotel, activity, other)
            limit: Maximum number of results to return

        Returns:
            List of matching places with details
        """
        results = places.copy()

        # Filter by type if specified
        if place_type:
            try:
                filter_type = PlaceType(place_type.lower())
                results = [p for p in results if p.type == filter_type]
            except ValueError:
                logger.warning(f"Invalid place type: {place_type}")

        # Filter by query if specified
        if query:
            query_lower = query.lower()
            results = [
                p
                for p in results
                if query_lower in p.name.lower()
                or query_lower in p.description.lower()
                or query_lower in p.mentioned_context.lower()
            ]

        # Limit results
        results = results[:limit]

        # Convert to dict for tool output
        return [
            {
                "name": p.name,
                "type": p.type.value,
                "description": p.description,
                "mentioned_context": p.mentioned_context,
                "video_id": p.video_id,
                "timestamp_seconds": p.timestamp_seconds,
            }
            for p in results
        ]

    return search_places


def create_get_transcript_tool(session: Session):
    """Create a tool for getting video transcripts."""

    @tool
    def get_video_transcript(video_id: str) -> str:
        """
        Get the full transcript for a specific video.

        Args:
            video_id: YouTube video ID

        Returns:
            Full transcript text or error message
        """
        video = next((v for v in session.videos if v.video_id == video_id), None)

        if video:
            return f"Transcript for '{video.title}':\n\n{video.transcript}"
        else:
            return f"Video {video_id} not found in session."

    return get_video_transcript


CHAT_SYSTEM_PROMPT = """You are a helpful travel planning assistant.
You have access to places and recommendations extracted from {num_videos} YouTube travel video(s).

Your tools:
- search_places: Find places by name, type (restaurant/attraction/hotel/activity), or keywords
- get_video_transcript: Get the full transcript of a video for more details

Guidelines:
1. Be concise and helpful in your responses
2. Always cite which video your recommendations come from
3. Use the search_places tool to find relevant places for user queries
4. If asked about specific details not in the place data, use get_video_transcript to find
   more context
5. Group similar recommendations together
6. Provide practical travel advice based on the extracted information

Available place types: restaurant, attraction, hotel, activity, other

Total places available: {total_places}"""


@observe()
async def chat_with_agent(
    session: Session,
    user_message: str,
    llm_client: LLMClient,
) -> tuple[str, list[str]]:
    """
    Process a chat message using the agent with tools.

    Args:
        session: User session with videos and places
        user_message: User's message
        llm_client: Configured LLM client

    Returns:
        Tuple of (assistant_response, list of referenced place IDs)

    Raises:
        Exception: If chat processing fails
    """
    # with tracer.start_as_current_span("chat_with_agent") as span:
    #     span.set_attribute("session.id", session.session_id)
    #     span.set_attribute("user.query", user_message)
    #     span.set_attribute("places.available", len(session.places))

    try:
        # Create tools with session context
        search_tool = create_search_places_tool(session.places)
        transcript_tool = create_get_transcript_tool(session)

        tools = [search_tool, transcript_tool]

        # Bind tools to the model
        model_with_tools = llm_client._model.bind_tools(tools)

        # Build conversation context
        system_prompt = CHAT_SYSTEM_PROMPT.format(
            num_videos=len(session.videos),
            total_places=len(session.places),
        )

        # Convert chat history to messages
        messages = [{"role": "system", "content": system_prompt}]

        # Add recent chat history (last 10 messages)
        for msg in session.chat_history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        # Convert to LangChain messages
        from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

        langchain_messages = []
        for msg in messages:
            if msg["role"] == "system":
                langchain_messages.append(SystemMessage(content=msg["content"]))
            elif msg["role"] == "user":
                langchain_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                langchain_messages.append(AIMessage(content=msg["content"]))

        # Invoke model with tools (iterative tool calling)
        response = await model_with_tools.ainvoke(langchain_messages)

        # Handle tool calls if present
        referenced_place_ids = []
        final_response = response.content

        if hasattr(response, "tool_calls") and response.tool_calls:
            # Execute tools and get results
            tool_results = []
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]

                logger.info(f"Executing tool: {tool_name} with args: {tool_args}")

                # Execute the tool
                if tool_name == "search_places":
                    result = search_tool.invoke(tool_args)
                    tool_results.append(result)

                    # Track referenced places
                    for place_dict in result:
                        # Find matching place by name and video_id
                        matching_place = next(
                            (
                                p
                                for p in session.places
                                if p.name == place_dict["name"]
                                and p.video_id == place_dict["video_id"]
                            ),
                            None,
                        )
                        if matching_place:
                            referenced_place_ids.append(matching_place.id)

                elif tool_name == "get_video_transcript":
                    result = transcript_tool.invoke(tool_args)
                    tool_results.append(result)

            # If tools were called, we should get a follow-up response
            # For simplicity, we'll use the tool results directly in the response
            # In a production system, you'd want to do another LLM call with tool results
            if tool_results and isinstance(tool_results[0], list):
                # Format search results into response
                places_found = tool_results[0]
                if places_found:
                    final_response = (
                        f"I found {len(places_found)} relevant place(s):\n\n"
                    )
                    for place in places_found[:5]:  # Limit to top 5
                        final_response += f"**{place['name']}** ({place['type']})\n"
                        final_response += f"{place['description']}\n"
                        final_response += f"_{place['mentioned_context']}_\n\n"
                else:
                    final_response = (
                        "I couldn't find any places matching your criteria. "
                        "Try a different search term or ask me about the available places!"
                    )

        # span.set_attribute("places.referenced", len(referenced_place_ids))
        logger.info(
            f"Chat response generated with {len(referenced_place_ids)} places referenced"
        )

        return final_response, referenced_place_ids

    except Exception as e:
        error_msg = f"Chat agent failed: {str(e)}"
        logger.error(error_msg)
        raise
