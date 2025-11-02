"use client";

import type { Place, VideoSummary } from "@/lib/types";

interface PlaceSummaryProps {
  videos: VideoSummary[];
  places: Place[];
}

export default function PlaceSummary({ videos, places }: PlaceSummaryProps) {
  if (videos.length === 0) {
    return null;
  }

  const placesByType = places.reduce((acc, place) => {
    if (!acc[place.type]) {
      acc[place.type] = [];
    }
    acc[place.type].push(place);
    return acc;
  }, {} as Record<string, Place[]>);

  return (
    <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-purple-900">
        Extracted Places ({places.length})
      </h2>

      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-purple-800">
          Source Videos
        </h3>
        <div className="space-y-2 md:space-y-3">
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
      </div>

      <div className="space-y-4 md:space-y-6">
        {Object.entries(placesByType).map(([type, typePlaces]) => (
          <div key={type}>
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 capitalize text-purple-800">
              {type}s
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {typePlaces.map((place) => (
                <div
                  key={place.id}
                  className="p-3 md:p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer active:bg-purple-100 touch-manipulation"
                >
                  <p className="font-semibold text-purple-900 text-sm md:text-base">
                    {place.name}
                  </p>
                  <p className="text-xs md:text-sm text-purple-700 mt-1">
                    {place.description}
                  </p>
                  <p className="text-xs text-purple-600 mt-2 italic">
                    {place.mentioned_context}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
