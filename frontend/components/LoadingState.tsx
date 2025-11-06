export default function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 md:h-14 md:w-14 border-4 border-[#E0D8CC]"></div>
        <div className="animate-spin rounded-full h-12 w-12 md:h-14 md:w-14 border-4 border-t-[#9AF18A] border-r-[#7BE068] absolute top-0 left-0"></div>
      </div>
      {message && <p className="mt-4 md:mt-5 text-[#4A4138] font-medium text-sm md:text-base">{message}</p>}
    </div>
  );
}
