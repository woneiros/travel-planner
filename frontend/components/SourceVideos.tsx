"use client";

import { useState } from "react";
import type { VideoSummary } from "@/lib/types";

interface SourceVideosProps {
  videos: VideoSummary[];
  onExtractMore: () => void;
}

export default function SourceVideos({
  videos,
  onExtractMore,
}: SourceVideosProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 text-left hover:bg-purple-50 rounded-lg p-2 transition-colors"
      >
        <h2 className="text-xl md:text-2xl font-bold text-purple-900">
          📼 Source Videos ({videos.length})
        </h2>
        <svg
          className={`w-6 h-6 text-purple-600 transition-transform ${
            isExpanded ? "rotate-180" : ""
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

      {isExpanded && (
        <>
          <div className="space-y-2 md:space-y-3 mb-4">
            {videos.map((video) => (
              <div
                key={video.video_id}
                className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
              >
                <p className="font-semibold text-purple-900 text-sm md:text-base">
                  {video.title}
                </p>
                <p className="text-xs md:text-sm text-purple-700 mt-1">
                  {video.summary}
                </p>
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  {video.places_count} places found
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onExtractMore}
            className="w-full py-2 px-4 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
          >
            + Extract more videos
          </button>
        </>
      )}
    </div>
  );
}
