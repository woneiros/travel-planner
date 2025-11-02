"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatDrawerProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, provider: "openai" | "anthropic") => void;
  isLoading: boolean;
}

export default function ChatDrawer({
  messages,
  onSendMessage,
  isLoading,
}: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim(), "anthropic");
      setInput("");
    }
  };

  return (
    <>
      {/* Chat Button - Fixed Bottom Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-full md:max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-t-2 border-purple-200 shadow-2xl rounded-t-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
              <span>💬</span> Chat with AI Agent
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
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
          </div>

          {/* Messages */}
          <div className="h-64 md:h-80 lg:h-96 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-purple-500 text-center">
                <svg
                  className="w-12 h-12 mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-sm">Ask me anything about the places!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 md:p-4 rounded-xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto max-w-[95%] sm:max-w-[85%] md:max-w-[80%]"
                      : "bg-white border-2 border-purple-200 text-purple-900 mr-auto max-w-[95%] sm:max-w-[85%] md:max-w-[80%]"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-80">
                    {msg.role === "user" ? "You" : "AI Agent"}
                  </p>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t border-purple-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about places, restaurants, etc..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:bg-purple-50 disabled:text-purple-400 placeholder-purple-300 text-purple-900 text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 md:px-8 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
