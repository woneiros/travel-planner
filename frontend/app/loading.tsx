export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F1] via-[#F6F0E8] to-[#EDE7DF]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4AA83D] mx-auto mb-4"></div>
        <p className="text-[#4A4138]">Loading...</p>
      </div>
    </div>
  );
}

