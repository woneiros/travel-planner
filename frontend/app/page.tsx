"use client";

import { useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import SourceVideos from "@/components/SourceVideos";
import PlaceSummary from "@/components/PlaceSummary";
import ChatDrawer from "@/components/ChatDrawer";
import LoadingState from "@/components/LoadingState";
import GradientBackground from "@/components/GradientBackground";
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
      setVideos((prev) => [...prev, ...response.videos]);

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
    <>
      <GradientBackground />
      <div className="min-h-screen py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="relative flex flex-col items-center mb-8 md:mb-10 gap-4 text-center">
          <div className="absolute top-0 right-0">
            <UserButton />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Image
              src="/Treki_Logo_Transparent.svg"
              alt="Treki Logo"
              width={200}
              height={90}
              priority
              unoptimized
              className="h-20 w-auto md:h-24 lg:h-28 flex-shrink-0"
            />
          </div>
          <p className="text-[#4A4138] text-base md:text-lg max-w-2xl">
            Extract travel recommendations from YouTube videos and plan your
            trip
          </p>
        </header>

        {error && (
          <div className="max-w-full md:max-w-4xl mx-auto mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-xl shadow-sm text-sm md:text-base">
            {error}
          </div>
        )}

        <div className="space-y-6 md:space-y-8 pb-24">
          <SourceVideos
            videos={videos}
            onSubmit={handleIngestVideos}
            isLoading={isIngesting}
          />

          {isIngesting && <LoadingState message="Processing videos..." />}

          {videos.length > 0 && (
            <PlaceSummary places={places} videos={videos} />
          )}
        </div>
      </div>

        {sessionId && (
          <ChatDrawer
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatting}
          />
        )}
      </div>
    </>
  );
}
