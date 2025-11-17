"use client";

import { useState } from "react";
import type { Place, PlaceType, Video } from "@/lib/types";

interface PlaceSummaryProps {
  places: Place[];
  videos: Video[];
}

const categoryEmojis: Record<PlaceType, string> = {
  restaurant: "🍽️",
  attraction: "🎪",
  hotel: "🛌",
  activity: "🕺",
  coffee_shop: "☕",
  shopping: "🛍️",
  other: "📍",
};

const categoryNames: Record<PlaceType, string> = {
  restaurant: "Restaurants",
  attraction: "Attractions",
  hotel: "Hotels",
  activity: "Activities",
  coffee_shop: "Coffee Shops & Bakeries",
  shopping: "Shopping",
  other: "Other",
};

export default function PlaceSummary({ places, videos }: PlaceSummaryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  if (places.length === 0) {
    return null;
  }

  // Create video ID to title mapping
  const videoMap = Object.fromEntries(videos.map((v) => [v.video_id, v.title]));

  const placesByType = places.reduce((acc, place) => {
    if (!acc[place.type]) {
      acc[place.type] = [];
    }
    acc[place.type].push(place);
    return acc;
  }, {} as Record<string, Place[]>);

  // Sort categories alphabetically
  const sortedCategories = Object.entries(placesByType).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const toggleCategory = (type: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E0D8CC]">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#121212]">
        📍 Extracted Places ({places.length})
      </h2>

      <div className="space-y-3 md:space-y-4">
        {sortedCategories.map(([type, typePlaces]) => {
          const isExpanded = expandedCategories.has(type);
          const placeType = type as PlaceType;
          const emoji = categoryEmojis[placeType] || "📍";
          const displayName = categoryNames[placeType] || type;

          return (
            <div
              key={type}
              className="border border-[#E0D8CC] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(type)}
                className="w-full flex items-center justify-between p-3 md:p-4 bg-[#F6F0E8]/50 hover:bg-[#F6F0E8] transition-colors text-left"
              >
                <h3 className="text-base md:text-lg font-semibold text-[#4A4138]">
                  {emoji} {displayName} ({typePlaces.length})
                </h3>
                <svg
                  className={`w-5 h-5 text-[#4AA83D] transition-transform flex-shrink-0 ml-2 ${
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
                <div className="p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 bg-white">
                  {typePlaces.map((place) => (
                    <div
                      key={place.id}
                      className="p-3 md:p-4 border-2 border-[#E0D8CC] rounded-xl hover:bg-[#F6F0E8] hover:border-[#9AF18A] transition-all cursor-pointer active:bg-[#EDE7DF] touch-manipulation"
                    >
                      <p className="font-semibold text-[#121212] text-sm md:text-base">
                        {place.name}
                      </p>
                      <p className="text-xs md:text-sm text-[#4A4138] mt-1">
                        {place.description}
                      </p>
                      <p className="text-xs text-[#6C6256] mt-2 italic">
                        {place.mentioned_context}
                      </p>
                      {place.video_id && videoMap[place.video_id] && (
                        <div className="mt-2 inline-block px-2 py-1 bg-[#F6F0E8]/70 border border-[#E0D8CC] rounded-lg">
                          <p className="text-xs text-[#4A4138] font-medium">
                            📹 {videoMap[place.video_id]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
