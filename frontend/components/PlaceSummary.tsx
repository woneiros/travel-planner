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

  const placesByType = places.reduce(
    (acc, place) => {
      if (!acc[place.type]) {
        acc[place.type] = [];
      }
      acc[place.type].push(place);
      return acc;
    },
    {} as Record<string, Place[]>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Extracted Places ({places.length})
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Videos Processed</h3>
        <div className="space-y-2">
          {videos.map((video) => (
            <div key={video.video_id} className="p-3 bg-gray-50 rounded">
              <p className="font-medium">{video.title}</p>
              <p className="text-sm text-gray-600">{video.summary}</p>
              <p className="text-xs text-gray-500">
                {video.places_count} places found
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(placesByType).map(([type, typePlaces]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold mb-2 capitalize">{type}s</h3>
            <div className="grid gap-2">
              {typePlaces.map((place) => (
                <div
                  key={place.id}
                  className="p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <p className="font-medium">{place.name}</p>
                  <p className="text-sm text-gray-600">{place.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
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
