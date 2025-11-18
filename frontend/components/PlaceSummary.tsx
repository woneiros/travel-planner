"use client";

import { useState } from "react";
import type {
  Place,
  PlaceType,
  Video,
  PlaceFilter,
  PlacePreference,
} from "@/lib/types";
import { useApi } from "@/lib/api-client";

interface PlaceSummaryProps {
  places: Place[];
  videos: Video[];
  sessionId: string | null;
  onPlaceUpdate?: (place: Place) => void;
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

export default function PlaceSummary({
  places,
  videos,
  sessionId,
  onPlaceUpdate,
}: PlaceSummaryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [filter, setFilter] = useState<PlaceFilter>("all");
  const [updatingPlaceId, setUpdatingPlaceId] = useState<string | null>(null);
  const api = useApi();

  if (places.length === 0) {
    return null;
  }

  // Filter places based on selected filter
  const filteredPlaces = places.filter((place) => {
    if (filter === "interested") return place.is_interested === true;
    if (filter === "not_interested") return place.is_not_interested === true;
    return true; // "all"
  });

  // Calculate counts
  const interestedCount = places.filter(
    (p) => p.is_interested === true
  ).length;
  const notInterestedCount = places.filter(
    (p) => p.is_not_interested === true
  ).length;

  // Create video ID to title mapping
  const videoMap = Object.fromEntries(
    videos.map((v) => [v.video_id, v.title])
  );

  const placesByType = filteredPlaces.reduce((acc, place) => {
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

  const handlePreferenceChange = async (
    place: Place,
    preference: PlacePreference
  ) => {
    if (!sessionId) return;

    setUpdatingPlaceId(place.id);
    try {
      const updatedPlace = await api.updatePlacePreference({
        session_id: sessionId,
        place_id: place.id,
        preference,
      });

      if (onPlaceUpdate) {
        onPlaceUpdate(updatedPlace);
      }
    } catch (error) {
      console.error("Failed to update preference:", error);
      // Could show toast notification here
    } finally {
      setUpdatingPlaceId(null);
    }
  };

  return (
    <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E0D8CC]">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#121212]">
        📍 Extracted Places ({places.length})
      </h2>

      {/* Filter buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[#4AA83D] text-white"
              : "bg-[#F6F0E8] text-[#4A4138] hover:bg-[#EDE7DF]"
          }`}
        >
          Show All <span className="font-normal font-mono">({places.length})</span>
        </button>
        <button
          onClick={() => setFilter("interested")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            filter === "interested"
              ? "bg-[#4AA83D] text-white"
              : "bg-[#F6F0E8] text-[#4A4138] hover:bg-[#EDE7DF]"
          }`}
        >
          Interested <span className="font-normal font-mono">({interestedCount})</span>
        </button>
        <button
          onClick={() => setFilter("not_interested")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            filter === "not_interested"
              ? "bg-[#4AA83D] text-white"
              : "bg-[#F6F0E8] text-[#4A4138] hover:bg-[#EDE7DF]"
          }`}
        >
          Not Interested <span className="font-normal font-mono">({notInterestedCount})</span>
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-8 text-[#4A4138]">
            <p>No places match the selected filter.</p>
          </div>
        ) : (
          sortedCategories.map(([type, typePlaces]) => {
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
                        className={`p-3 md:p-4 border-2 rounded-xl transition-all ${
                          place.is_interested
                            ? "border-[#4AA83D] bg-[#F0F9ED]"
                            : place.is_not_interested
                            ? "border-gray-300 opacity-80"
                            : "border-[#E0D8CC]"
                        } hover:bg-[#F6F0E8] hover:border-[#9AF18A]`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#121212] text-sm md:text-base">
                              {place.name}
                            </p>
                            <p className="text-xs md:text-sm text-[#4A4138] mt-1">
                              {place.description}
                            </p>
                            <p className="text-xs text-[#6C6256] mt-2 italic">
                              {place.mentioned_context}
                            </p>
                            {(place.address || place.neighborhood) && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-[#4A4138]">
                                  <span className="font-medium">Address:</span>{" "}
                                  {place.address || "N/A"}
                                </p>
                                <p className="text-xs text-[#4A4138]">
                                  <span className="font-medium">Neighborhood:</span>{" "}
                                  {place.neighborhood || "N/A"}
                                </p>
                              </div>
                            )}
                            {place.video_id && videoMap[place.video_id] && (
                              <div className="mt-2 inline-block px-2 py-1 bg-[#F6F0E8]/70 border border-[#E0D8CC] rounded-lg">
                                <p className="text-xs text-[#4A4138] font-medium">
                                  📹 {videoMap[place.video_id]}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Toggle buttons */}
                          <div className="flex gap-1 ml-2 flex-shrink-0">
                            {/* Heart button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreferenceChange(
                                  place,
                                  place.is_interested ? "neutral" : "interested"
                                );
                              }}
                              disabled={updatingPlaceId === place.id}
                              className={`p-1.5 rounded-lg transition-colors ${
                                place.is_interested
                                  ? "text-red-500 bg-red-50"
                                  : "text-gray-400 hover:text-red-400 hover:bg-red-50/50"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              aria-label={
                                place.is_interested
                                  ? "Remove from interested"
                                  : "Mark as interested"
                              }
                            >
                              <svg
                                className="w-5 h-5"
                                fill={place.is_interested ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>

                            {/* Thumbs down button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreferenceChange(
                                  place,
                                  place.is_not_interested
                                    ? "neutral"
                                    : "not_interested"
                                );
                              }}
                              disabled={updatingPlaceId === place.id}
                              className={`p-1.5 rounded-lg transition-colors ${
                                place.is_not_interested
                                  ? "text-gray-600 bg-gray-100"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              aria-label={
                                place.is_not_interested
                                  ? "Remove from not interested"
                                  : "Mark as not interested"
                              }
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M15 3H6c-.83 0-1.54.5-1.85 1.22l-3.02 7.05c-.09.23-.13.47-.13.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
