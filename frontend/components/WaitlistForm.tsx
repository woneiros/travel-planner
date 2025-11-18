"use client";

import { useState } from "react";

interface WaitlistFormProps {
  onSuccess?: () => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response. Please try again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setIsSuccess(true);
      setEmail("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Waitlist form error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 md:p-8 bg-[#F0FCF0] border-2 border-[#4AA83D] rounded-xl text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl md:text-2xl font-display font-medium text-[#121212] mb-2">
          You're on the list!
        </h3>
        <p className="text-[#4A4138]">
          We'll notify you when Treki is ready. Thanks for your interest!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-3 md:py-4 rounded-xl border-2 border-[#E0D8CC] focus:border-[#4AA83D] focus:outline-none text-[#121212] text-base md:text-lg bg-white"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 md:px-8 py-3 md:py-4 bg-[#4AA83D] text-white font-medium rounded-xl hover:bg-[#3A8430] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg whitespace-nowrap"
        >
          {isLoading ? "Joining..." : "Join Waitlist"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
      )}
    </form>
  );
}

