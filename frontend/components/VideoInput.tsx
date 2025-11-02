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
    <div className="w-full max-w-full md:max-w-2xl mx-auto p-4 md:p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-purple-900">Add YouTube Videos</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 md:mb-5">
          <label htmlFor="urls" className="block text-sm font-medium mb-2 text-purple-800">
            YouTube URLs (one per line, max 10)
          </label>
          <textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full h-24 md:h-32 lg:h-40 px-3 md:px-4 py-2 md:py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder-purple-300 text-sm md:text-base"
            disabled={isLoading}
          />
        </div>

        <div className="mb-4 md:mb-5">
          <label className="block text-sm font-medium mb-3 text-purple-800">LLM Provider</label>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <label className="flex items-center w-full md:w-auto px-4 py-3 md:py-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer touch-manipulation">
              <input
                type="radio"
                value="openai"
                checked={provider === "openai"}
                onChange={(e) =>
                  setProvider(e.target.value as "openai" | "anthropic")
                }
                disabled={isLoading}
                className="mr-3 md:mr-2 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="text-purple-800 font-medium">OpenAI</span>
            </label>
            <label className="flex items-center w-full md:w-auto px-4 py-3 md:py-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer touch-manipulation">
              <input
                type="radio"
                value="anthropic"
                checked={provider === "anthropic"}
                onChange={(e) =>
                  setProvider(e.target.value as "openai" | "anthropic")
                }
                disabled={isLoading}
                className="mr-3 md:mr-2 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="text-purple-800 font-medium">Anthropic</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || urls.trim().length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 md:py-3 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
        >
          {isLoading ? "Processing..." : "Extract Places"}
        </button>
      </form>
    </div>
  );
}
