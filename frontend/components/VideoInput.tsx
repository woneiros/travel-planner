"use client";

import { useState } from "react";

interface VideoInputProps {
  onSubmit: (urls: string[], provider: "openai" | "anthropic") => void;
  isLoading: boolean;
}

export default function VideoInput({ onSubmit, isLoading }: VideoInputProps) {
  const [urls, setUrls] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length > 0) {
      onSubmit(urlList, provider);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add YouTube Videos</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="urls" className="block text-sm font-medium mb-2">
            YouTube URLs (one per line, max 10)
          </label>
          <textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">LLM Provider</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="openai"
                checked={provider === "openai"}
                onChange={(e) =>
                  setProvider(e.target.value as "openai" | "anthropic")
                }
                disabled={isLoading}
                className="mr-2"
              />
              OpenAI
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="anthropic"
                checked={provider === "anthropic"}
                onChange={(e) =>
                  setProvider(e.target.value as "openai" | "anthropic")
                }
                disabled={isLoading}
                className="mr-2"
              />
              Anthropic
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || urls.trim().length === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Extract Places"}
        </button>
      </form>
    </div>
  );
}
