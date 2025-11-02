"use client";

import { useState, useEffect, useRef } from "react";
import VideoInput from "./VideoInput";
import type { VideoSummary } from "@/lib/types";

interface SourceVideosProps {
  videos: VideoSummary[];
  onSubmit: (urls: string[], provider: "openai" | "anthropic") => void;
  isLoading: boolean;
}

export default function SourceVideos({
  videos,
  onSubmit,
  isLoading,
}: SourceVideosProps) {
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [showAddMoreForm, setShowAddMoreForm] = useState(false);
  const prevVideosLengthRef = useRef(videos.length);

  // When new videos are added, collapse the form but keep card expanded
  useEffect(() => {
    if (videos.length > prevVideosLengthRef.current && videos.length > 0) {
      setShowAddMoreForm(false);
      setIsCardExpanded(true);
    }
    prevVideosLengthRef.current = videos.length;
  }, [videos.length]);

  // If no videos yet, show the input form directly (not collapsed)
  if (videos.length === 0) {
    return <VideoInput onSubmit={onSubmit} isLoading={isLoading} />;
  }

  return (
    <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
      {/* Title with chevron - always visible and clickable */}
      <button
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className="w-full flex items-center justify-between mb-4 text-left hover:bg-purple-50/50 -m-2 p-2 rounded-lg transition-colors"
      >
        <h2 className="text-xl md:text-2xl font-bold text-purple-900">
          📼 Source Videos ({videos.length})
        </h2>
        <svg
          className={`w-5 h-5 text-purple-600 transition-transform flex-shrink-0 ${
            isCardExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* State 1: Collapsed - show only extract button */}
      {!isCardExpanded && (
        <button
          onClick={() => {
            setIsCardExpanded(true);
            setShowAddMoreForm(false);
          }}
          className="w-full py-2 px-4 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
        >
          + Extract more videos
        </button>
      )}

      {/* State 2 & 3: Expanded - show video cards and either button or form */}
      {isCardExpanded && (
        <>
          {/* Video cards section */}
          <div className="mb-4 space-y-2">
            {videos.map((video) => (
              <div
                key={video.video_id}
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
              >
                <p className="font-semibold text-purple-900 text-sm">
                  {video.title}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {video.summary}
                </p>
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  {video.places_count} places found
                </p>
              </div>
            ))}
          </div>

          {/* State 2: Show extract button if form not visible */}
          {!showAddMoreForm && (
            <button
              onClick={() => setShowAddMoreForm(true)}
              className="w-full py-2 px-4 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
            >
              + Extract more videos
            </button>
          )}

          {/* State 3: Show Add More form */}
          {showAddMoreForm && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <VideoInput
                onSubmit={onSubmit}
                isLoading={isLoading}
                title="Add More YouTube Videos"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
