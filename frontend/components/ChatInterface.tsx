"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, provider: "openai" | "anthropic") => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  disabled,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim(), "anthropic");
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-full md:max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-purple-900">Chat with AI Agent</h2>

      <div className="mb-4 md:mb-6 h-64 md:h-96 lg:h-[500px] overflow-y-auto border-2 border-purple-200 rounded-xl p-3 md:p-5 space-y-2 md:space-y-3 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
        {messages.length === 0 ? (
          <p className="text-purple-500 text-center text-sm md:text-base">
            {disabled
              ? "Process videos first to start chatting"
              : "Start chatting about the places..."}
          </p>
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
              <p className="text-xs font-semibold mb-1 md:mb-2 opacity-80">
                {msg.role === "user" ? "You" : "AI Agent"}
              </p>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              disabled
                ? "Process videos first..."
                : "Ask about places, restaurants, etc..."
            }
            disabled={disabled || isLoading}
            className="flex-1 px-3 md:px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:bg-purple-50 disabled:text-purple-400 placeholder-purple-300 text-purple-900 transition-all text-sm md:text-base"
          />
          <button
            type="submit"
            disabled={disabled || isLoading || !input.trim()}
            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 md:px-8 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
