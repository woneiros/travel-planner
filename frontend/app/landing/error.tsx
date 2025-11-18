"use client";

export default function LandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F1] via-[#F6F0E8] to-[#EDE7DF]">
      <div className="text-center px-4 max-w-md">
        <h2 className="text-2xl font-display font-medium text-[#121212] mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-[#4A4138] mb-2">{error.message}</p>
        {error.digest && (
          <p className="text-sm text-[#6C6256] mb-6">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#4AA83D] text-white font-medium rounded-xl hover:bg-[#3A8430] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

