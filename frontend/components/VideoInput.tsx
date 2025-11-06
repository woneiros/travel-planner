"use client";

import { useState } from "react";

interface VideoInputProps {
  onSubmit: (urls: string[], provider: "openai" | "anthropic") => void;
  isLoading: boolean;
  title?: string;
}

export default function VideoInput({ onSubmit, isLoading, title = "Add YouTube Videos" }: VideoInputProps) {
  const [urls, setUrls] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length > 0) {
      onSubmit(urlList, "anthropic");
    }
  };

  return (
    <div className="w-full max-w-full md:max-w-2xl mx-auto p-4 md:p-6 lg:p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E0D8CC]">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#121212]">
        {title}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 md:mb-5">
          <label
            htmlFor="urls"
            className="block text-sm font-medium mb-2 text-[#4A4138]"
          >
            YouTube URLs (one per line, max 10)
          </label>
          <textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full h-24 md:h-32 lg:h-40 px-3 md:px-4 py-2 md:py-3 border-2 border-[#E0D8CC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9AF18A] focus:border-transparent transition-all placeholder-[#C9BFB0] text-[#121212] text-sm md:text-base"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || urls.trim().length === 0}
          className="w-full bg-gradient-to-r from-[#9AF18A] to-[#7BE068] text-[#121212] py-3 md:py-3 px-6 rounded-xl font-semibold hover:from-[#A8F18F] hover:to-[#5BC84A] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
        >
          {isLoading
            ? "Give me a minute to process the videos..."
            : "Extract Places"}
        </button>
      </form>
    </div>
  );
}
