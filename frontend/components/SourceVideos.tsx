"use client";

import { useState, useEffect, useRef } from "react";
import VideoInput from "./VideoInput";
import type { VideoSummary } from "@/lib/types";

interface SourceVideosProps {
  videos: VideoSummary[];
  onSubmit: (urls: string[]) => void;
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
    <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E0D8CC]">
      {/* Title with chevron - always visible and clickable */}
      <button
        onClick={() => setIsCardExpanded(!isCardExpanded)}
        className="w-full flex items-center justify-between mb-4 text-left hover:bg-[#F6F0E8]/50 -m-2 p-2 rounded-lg transition-colors"
      >
        <h2 className="text-xl md:text-2xl font-bold text-[#121212]">
          📼 Source Videos ({videos.length})
        </h2>
        <svg
          className={`w-5 h-5 text-[#4AA83D] transition-transform flex-shrink-0 ${
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
          className="w-full py-2 px-4 text-sm font-medium text-[#4AA83D] hover:text-[#3A8430] hover:bg-[#F6F0E8] rounded-lg transition-colors border border-[#E0D8CC]"
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
                className="p-3 bg-gradient-to-r from-[#FDF8F1] to-[#F6F0E8] rounded-xl border border-[#E0D8CC]"
              >
                <p className="font-semibold text-[#121212] text-sm">
                  {video.title}
                </p>
                <p className="text-xs text-[#4A4138] mt-1">{video.summary}</p>
                <p className="text-xs text-[#4AA83D] mt-1 font-medium">
                  {video.places_count} places found
                </p>
              </div>
            ))}
          </div>

          {/* State 2: Show extract button if form not visible */}
          {!showAddMoreForm && (
            <button
              onClick={() => setShowAddMoreForm(true)}
              className="w-full py-2 px-4 text-sm font-medium text-[#4AA83D] hover:text-[#3A8430] hover:bg-[#F6F0E8] rounded-lg transition-colors border border-[#E0D8CC]"
            >
              + Extract more videos
            </button>
          )}

          {/* State 3: Show Add More form */}
          {showAddMoreForm && (
            <div className="mt-4 pt-4 border-t border-[#E0D8CC]">
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
