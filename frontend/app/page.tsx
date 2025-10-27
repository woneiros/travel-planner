"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import VideoInput from "@/components/VideoInput";
import PlaceSummary from "@/components/PlaceSummary";
import ChatInterface from "@/components/ChatInterface";
import LoadingState from "@/components/LoadingState";
import { useApi } from "@/lib/api-client";
import type {
  VideoSummary,
  Place,
  ChatMessage,
  IngestResponse,
} from "@/lib/types";

export default function Home() {
  const api = useApi();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIngestVideos = async (
    urls: string[],
    provider: "openai" | "anthropic"
  ) => {
    setIsIngesting(true);
    setError(null);

    try {
      const response: IngestResponse = await api.ingestVideos({
        video_urls: urls,
        llm_provider: provider,
      });

      setSessionId(response.session_id);
      setVideos(response.videos);

      // Fetch full session to get places
      const session = await api.getSession(response.session_id);
      setPlaces(session.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest videos");
      console.error("Ingestion error:", err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSendMessage = async (
    message: string,
    provider: "openai" | "anthropic"
  ) => {
    if (!sessionId) return;

    setIsChatting(true);
    setError(null);

    // Add user message to UI
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
      places_referenced: [],
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.sendMessage({
        session_id: sessionId,
        message,
        llm_provider: provider,
      });

      // Add assistant message to UI
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString(),
        places_referenced: response.places_referenced,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Chat error:", err);
      // Remove user message if failed
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Travel Planner AI
          </h1>
          <p className="text-gray-600">
            Extract travel recommendations from YouTube videos and plan your
            trip
          </p>
        </header>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <VideoInput onSubmit={handleIngestVideos} isLoading={isIngesting} />

          {isIngesting && <LoadingState message="Processing videos..." />}

          {videos.length > 0 && (
            <>
              <PlaceSummary videos={videos} places={places} />
              <ChatInterface
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatting}
                disabled={!sessionId}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
