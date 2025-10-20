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
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim(), provider);
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Chat with AI Agent</h2>

      <div className="mb-4 h-96 overflow-y-auto border border-gray-200 rounded p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">
            {disabled
              ? "Process videos first to start chatting"
              : "Start chatting about the places..."}
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded ${
                msg.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%]"
                  : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {msg.role === "user" ? "You" : "AI Agent"}
              </p>
              <p className="text-sm">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
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
                disabled={disabled || isLoading}
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
                disabled={disabled || isLoading}
                className="mr-2"
              />
              Anthropic
            </label>
          </div>
        </div>

        <div className="flex gap-2">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={disabled || isLoading || !input.trim()}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
